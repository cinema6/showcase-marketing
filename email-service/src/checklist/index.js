/* globals Buffer, console, global */

var q = require('q');
var ld = require('lodash');
var aws = require('aws-sdk');
var hubspot = require('./hubspot');
var postmark = require('./postmark');

var lib = {};

function returnState(state) {
    return function() {
        return state;
    };
}

lib.success = function(state) {
    state.context.succeed('SUCCESS!');
};

lib.send = function(state) {
    var config = state.config,
        user = state.event.body.user,
        headers = state.event.params.header,
        cookieMatch = headers.Cookie && headers.Cookie.match(/hubspotutk=([^\s;]+)/),
        trackingCookie = cookieMatch ? cookieMatch[1] : null;

    var sendHubspot = user.hubspotLead ?
        hubspot.send({
            portal: config.hubspot.portal,
            form: config.hubspot.form,
            cookie: trackingCookie,
            model: user
        }).catch(lib.handleError('sendHubspot')) :
        q(null);

    var sendPostmark = q.all(state.model.map(function(model) {
        return postmark.send({
            key: config.postmark.key,
            template: config.postmark.template,
            from: config.postmark.from,
            to: model.to,
            model: model.data
        });
    })).catch(lib.handleError('sendPostmarkEmail'));

    return q.all([sendHubspot, sendPostmark])
        .then(returnState(state));
};

lib.prepareModel = function(state) {
    var total = 0,
        finished = 0,
        data = state.event.body,
        recipients = data.recipients || [],
        users = (data.user.sendCopy ?
            recipients.concat({
                email: data.user.email,
                name: data.user.firstName + ' ' + data.user.lastName
            }) :
            recipients),
        checklist = data.checklist.map(function(section) {
            var items = section.items.reduce(function(result, item) {
                    result[(item.done ? 'completed' : 'pending')].push(item);
                    return result;
                }, {
                    completed: [],
                    pending: []
                });

            total += section.items.length;
            finished += items.completed.length;

            return {
                title: section.title,
                status: items.completed.length + '/' + section.items.length,
                completed: items.completed.length ? items.completed : [{title: 'None'}],
                pending: items.pending.length ? items.pending : [{title: 'None'}]
            };
        });

    state.model = users.map(function(user) {
        return {
            to: user.email,
            data: {
                user: data.user.firstName + ' ' + data.user.lastName,
                checklist: checklist,
                finished: finished,
                app: data.appName,
                name: user.name,
                total: total
            }
        };
    });

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
            Key : state.context.functionName + '/' + state.event.stageVariables.version + '.json',
        };

    return s3GetObject(params)
        .then(function(data) {
            state.config = JSON.parse(data.Body.toString());

            return state;
        })
        .catch(lib.handleError('s3GetConfig'));
};

lib.validate = function(state) {
    var data = state.event.body;

    if (data && data.user && data.user.firstName && data.user.lastName &&
        data.user.email && data.checklist && data.appName) {
        return q(state);
    }

    return q.reject({
        message: 'Missing required fields'
    });
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

    lib.validate(state)
        .then(lib.getConfig)
        .then(lib.parseConfig)
        .then(lib.prepareModel)
        .then(lib.send)
        .then(lib.success)
        .catch(function(err) {
            context.fail('Error: ' + err.message);
        });
};

if (!!global.jasmine) {
    module.exports = lib;
} else {
    module.exports.handler = lib.handler;
}
