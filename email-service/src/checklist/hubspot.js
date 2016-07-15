var q = require('q');
var https = require('https');
var querystring = require('querystring');

var lib = {};

lib.send = function(config) {
    var user = config.model,
        hsContext = config.cookie ? { hutk: config.cookie } : {},
        body = querystring.stringify({
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            'hs_context': JSON.stringify(hsContext)
        }),
        options = {
            host: 'forms.hubspot.com',
            port: 443,
            method: 'POST',
            path: '/uploads/form/v2/' + config.portal + '/' + config.form,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length
            }
        };

    return q.Promise(function(resolve, reject) {
        var req = https.request(options, function(response) {
            var status = response.statusCode;

            if (status === 204 || status === 302) {
                return resolve(response);
            } else {
                return reject('Hubspot request failed, status code: ' + status);
            }
        });

        req.on('error', function(err) {
            return reject(err);
        });

        req.write(body);
        req.end();
    });
};

module.exports = lib;
