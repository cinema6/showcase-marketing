/* globals Buffer, console, global */

var q = require('q');
var aws = require('aws-sdk');
var ld = require('lodash');
var postmark = require('postmark');

var lib = {};

lib.success = function(state) {
    state.context.succeed('SUCCESS!');
};

lib.sendHubspot = function(state) {
    // TODO: send something to Hubspot?
    return q(state);
};

lib.sendPostmark = function(state) {
    var config = state.config,
        postmarkClient = new postmark.Client(config.postmark.key);

    return q.Promise(function(resolve, reject) {
        return postmarkClient.sendEmailWithTemplate({
            TemplateId: config.postmark.template,
            TemplateModel: state.model,
            InlineCss: true,
            From: config.postmark.from,
            To: state.event.To,
            TrackOpens: true
            // Tag: template,
            // Attachments: email.attachments.map(function(attachment, index) {
            //     return {
            //         Name: attachment.filename,
            //         Content: files[index],
            //         ContentType: 'image/png',
            //         ContentID: 'cid:' + attachment.cid
            //     };
            // })
        }, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(state);
            }
        });
    }).catch(lib.handleError('sendPostmarkEmail'));
};

lib.prepareModel = function(state) {
    // we have not determined what data will be POSTed
    // from the front end. We'll likely need some logic
    // to map/convert data to something usable for Postmark
    state.model = state.event.TemplateModel;
    return q(state);
};

lib.parseConfig = function(state) {
    if (!state.config.encrypted) {
        return q(state);
    }

    var kms = new aws.KMS({ region : 'us-east-1' }),
        kmsDecrypt = q.nbind(kms.decrypt, kms);

    return kmsDecrypt({
        CiphertextBlob : new Buffer(state.config.encrypted, 'base64')
    })
    .then(function(data){
        delete state.config.encrypted;

        ld.merge(state.config, JSON.parse(data.Plaintext.toString()));

        return state;

    }).catch(lib.handleError('kmsDecrypt'));
};

lib.getConfig = function(state) {
    var s3 = new aws.S3(),
        s3GetObject = q.nbind(s3.getObject, s3),
        params = {
            Bucket : 'com.cinema6.lambda',
            Key : state.context.functionName + '/' + state.context.functionVersion + '.json',
        };

    return s3GetObject(params)
        .then(function(data) {
            state.config = JSON.parse(data.Body.toString());

            return state;
        })
        .catch(lib.handleError('s3GetConfig'));
};

lib.handleError = function(context) {
    return function(err) {
        console.log(context, ': ', err);

        return q.reject(err);
    };
};

lib.handler = function(event, context) {
    var state = {
        started: Date.now(),
        event: event,
        context: context
    };

    lib.getConfig(state)
        .then(lib.parseConfig)
        .then(lib.prepareModel)
        .then(lib.sendPostmark)
        .then(lib.sendHubspot)
        .then(lib.success)
        .catch(function(err) {
            context.fail(err.message);
        });
};

if (!!global.jasmine) {
    module.exports = lib;
} else {
    module.exports.handler = lib.handler;
}
