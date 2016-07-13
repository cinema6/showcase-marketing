var q = require('q');
var postmark = require('postmark');

var lib = {};

lib.send = function(config) {
    var postmarkClient = new postmark.Client(config.key);

    return q.Promise(function(resolve, reject) {
        return postmarkClient.sendEmailWithTemplate({
            TemplateId: config.template,
            TemplateModel: config.model,
            From: config.from,
            To: config.to,
            InlineCss: true,
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
                resolve(config);
            }
        });
    });
};

module.exports = lib;
