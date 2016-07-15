describe('Postmark Utility', function() {
    var lib, q, postmark;
    var success, failure;
    var config, model, key;
    var sendEmailSpy, sendEmailCallback;

    function PostmarkClient(secretKey) {
        key = secretKey;
    }

    beforeEach(function() {
        lib = require('../../src/checklist/postmark');
        postmark = require('postmark');
        q = require('q');

        success = jasmine.createSpy('success()');
        failure = jasmine.createSpy('failure()');

        config = {};
        model = {};
    });

    afterEach(function() {
        lib = null;
        q = null;
        postmark = null;
        success = null;
        failure = null;
        config = null;
        model = null;
        key = null;
        sendEmailSpy = null;
        sendEmailCallback = null;
    });

    describe('send(config)', function() {
        beforeEach(function(done) {
            sendEmailSpy = jasmine.createSpy('Client.sendEmailWithTemplate()')
                .and.callFake(function(config, cb) {
                    sendEmailCallback = cb;
                });

            PostmarkClient.prototype.sendEmailWithTemplate = sendEmailSpy;

            postmark.Client = PostmarkClient;

            config = {
                key: 'super-secret-key',
                template: 123,
                from: 'support@reelcontent.com',
                to: 'smunson@reelcontent.com',
                model: model
            };

            result = lib.send(config).then(success, failure);

            setTimeout(done);
        });

        it('should return a promise', function() {
            expect(result.then).toBeDefined();
        });

        it('should pass the postmark key to the constructor', function() {
            expect(key).toBe(config.key);
        });

        it('should call sendEmailWithTemplate method with config and callback', function() {
            expect(sendEmailSpy).toHaveBeenCalledWith({
                TemplateId: config.template,
                TemplateModel: model,
                From: config.from,
                To: config.to,
                InlineCss: true,
                TrackOpens: true
            }, jasmine.any(Function));
        });

        describe('when the email is successfully sent', function() {
            beforeEach(function(done) {
                sendEmailCallback(null, 'Success!');

                setTimeout(done);
            });

            it('should resolve the promise with the config', function() {
                expect(success).toHaveBeenCalledWith(config);
            });
        });

        describe('when the email fails to send', function() {
            beforeEach(function(done) {
                sendEmailCallback('Error!', null);

                setTimeout(done);
            });

            it('should reject the promise', function() {
                expect(success).not.toHaveBeenCalledWith(config);
                expect(failure).toHaveBeenCalledWith('Error!');
            });
        });
    });
});