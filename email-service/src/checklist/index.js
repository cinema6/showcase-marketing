/* globals Buffer, console, global */

var q = require('q');
var ld = require('lodash');
var aws = require('aws-sdk');
var https = require('https');
var postmark = require('postmark');
var querystring = require('querystring');

var lib = {};

lib.success = function(state) {
    state.context.succeed('SUCCESS!');
};

lib.sendHubspot = function(state) {
    var config = state.config,
        data = state.event.body,
        headers = state.event.params.header,
        cookieMatch = headers.Cookie && headers.Cookie.match(/hubspotutk=([^\s;]+)/),
        trackingCookie = cookieMatch ? cookieMatch[1] : null,
        hsContext = trackingCookie ? { hutk: trackingCookie } : {},
        body = querystring.stringify({
            firstname: data.firstName,
            lastname: data.lastName,
            email: data.To,
            'hs_context': JSON.stringify(hsContext)
        }),
        options = {
            host: 'forms.hubspot.com',
            port: 443,
            method: 'POST',
            path: '/uploads/form/v2/' + config.hubspot.portal + '/' + config.hubspot.form,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length
            }
        };

    if (!data.hubspotLead) {
        return q(state);
    }

    return q.Promise(function(resolve, reject) {
        var req = https.request(options, function(response) {
            var status = response.statusCode;

            if (status === 204 || status === 302) {
                return resolve(state);
            } else {
                return reject('Hubspot request failed, status code: ' + status);
            }
        });

        req.on('error', function(err) {
            return reject(err);
        });

        req.write(body);
        req.end();
    }).catch(lib.handleError('sendHubspot'));
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
            To: state.event.body.To,
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
    state.model = state.event.body.TemplateModel;
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
