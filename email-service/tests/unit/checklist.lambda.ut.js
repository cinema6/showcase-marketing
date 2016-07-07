describe('Checklist Lambda Function', function() {
    var lib, aws, postmark, q;

    var state, event, context;

    var success, failure, result,
        response, config, region, key;

    // deferreds
    var deferreds;
    var getConfigDeferred,
        parseConfigDeferred,
        prepareModelDeferred,
        sendPostmarkDeferred,
        sendHubspotDeferred,
        libSuccessDeferred;

    // spies + callbacks
    var getObjectSpy, getObjectCallback,
        decryptSpy, decryptCallback,
        sendEmailSpy, sendEmailCallback;

    function S3() {}

    function KMS(config) {
        region = config.region;
    }

    function PostmarkClient(secretKey) {
        key = secretKey;
    }

    beforeEach(function() {
        lib = require('../../src/checklist');
        aws = require('aws-sdk');
        postmark = require('postmark');
        q = require('q');

        success = jasmine.createSpy('success()');
        failure = jasmine.createSpy('failure()');

        event = {};
        context = {
            functionName: 'checklistLambda',
            functionVersion: '$LATEST'
        };
        state = {
            event: event,
            context: context
        };

        deferreds = {
            getConfig: q.defer(),
            parseConfig: q.defer(),
            prepareModel: q.defer(),
            sendPostmark: q.defer(),
            sendHubspot: q.defer(),
            success: q.defer()
        };
    });

    afterEach(function() {
        lib = null;
        aws = null;
        postmark = null;
        q = null;

        state = null;
        event = null;
        context = null;

        success = null;
        failure = null;
        result = null;
        response = null;
        config = null;
        region = null;
        key = null;

        deferreds = null;

        getObjectSpy = null;
        getObjectCallback = null;
        decryptSpy = null;
        decryptCallback = null;
        sendEmailSpy = null;
        sendEmailCallback = null;
    });

    describe('handler(event, context, callback)', function() {
        beforeEach(function(done) {
            state = {};

            context.fail = jasmine.createSpy('context.fail()');

            ['getConfig','parseConfig','prepareModel','sendPostmark',
            'sendHubspot','success'].forEach(function(prop) {
                spyOn(lib, prop).and.returnValue(deferreds[prop].promise);
            });

            lib.handler(event, context);

            setTimeout(done);
        });

        it('should call getConfig with the state', function() {
            expect(lib.getConfig).toHaveBeenCalledWith({
                started: jasmine.any(Number),
                event: event,
                context: context
            });
        });

        describe('when getConfig resolves', function() {
            beforeEach(function(done) {
                deferreds.getConfig.resolve(state);

                setTimeout(done);
            });

            it('should call parseConfig', function() {
                expect(lib.parseConfig).toHaveBeenCalledWith(state);
            });

            describe('when parseConfig resolves', function() {
                beforeEach(function(done) {
                    deferreds.parseConfig.resolve(state);

                    setTimeout(done);
                });

                it('should call prepareModel', function() {
                    expect(lib.prepareModel).toHaveBeenCalledWith(state);
                });

                describe('when prepareModel resolves', function() {
                    beforeEach(function(done) {
                        deferreds.prepareModel.resolve(state);

                        setTimeout(done);
                    });

                    it('should call sendPostmark', function() {
                        expect(lib.sendPostmark).toHaveBeenCalledWith(state);
                    });

                    describe('when sendPostmark resolves', function() {
                        beforeEach(function(done) {
                            deferreds.sendPostmark.resolve(state);

                            setTimeout(done);
                        });

                        it('should call sendHubspot', function() {
                            expect(lib.sendHubspot).toHaveBeenCalledWith(state);
                        });

                        describe('when sendHubspot resolves', function() {
                            beforeEach(function(done) {
                                deferreds.sendHubspot.resolve(state);

                                setTimeout(done);
                            });

                            it('should call success', function() {
                                expect(lib.success).toHaveBeenCalledWith(state);
                            });

                            describe('when success fails', function() {
                                beforeEach(function(done) {
                                    deferreds.success.reject({ message: 'Error!' });

                                    setTimeout(done);
                                });

                                it('should pass error message to context.fail()', function() {
                                    expect(context.fail).toHaveBeenCalledWith('Error!');
                                });
                            });
                        });

                        describe('when sendHubspot fails', function() {
                            beforeEach(function(done) {
                                deferreds.sendHubspot.reject({ message: 'Error!' });

                                setTimeout(done);
                            });

                            it('should pass error message to context.fail()', function() {
                                expect(context.fail).toHaveBeenCalledWith('Error!');
                            });

                            it('should not call success', function() {
                                expect(lib.success).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when sendPostmark fails', function() {
                        beforeEach(function(done) {
                            deferreds.sendPostmark.reject({ message: 'Error!' });

                            setTimeout(done);
                        });

                        it('should pass error message to context.fail()', function() {
                            expect(context.fail).toHaveBeenCalledWith('Error!');
                        });

                        it('should not call sendHubspot', function() {
                            expect(lib.sendHubspot).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('when prepareModel fails', function() {
                    beforeEach(function(done) {
                        deferreds.prepareModel.reject({ message: 'Error!' });

                        setTimeout(done);
                    });

                    it('should pass error message to context.fail()', function() {
                        expect(context.fail).toHaveBeenCalledWith('Error!');
                    });

                    it('should not call sendPostmark', function() {
                        expect(lib.sendPostmark).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when parseConfig fails', function() {
                beforeEach(function(done) {
                    deferreds.parseConfig.reject({ message: 'Error!' });

                    setTimeout(done);
                });

                it('should pass error message to context.fail()', function() {
                    expect(context.fail).toHaveBeenCalledWith('Error!');
                });

                it('should not call prepareModel', function() {
                    expect(lib.prepareModel).not.toHaveBeenCalled();
                });
            });
        });

        describe('when getConfig fails', function() {
            beforeEach(function(done) {
                deferreds.getConfig.reject({ message: 'Error!' });

                setTimeout(done);
            });

            it('should pass error message to context.fail()', function() {
                expect(context.fail).toHaveBeenCalledWith('Error!');
            });

            it('should not call parseConfig', function() {
                expect(lib.parseConfig).not.toHaveBeenCalled();
            });
        });
    });

    describe('getConfig(state)', function() {
        beforeEach(function(done) {
            getObjectSpy = jasmine.createSpy('s3.getObject()')
                .and.callFake(function(params, cb) {
                    getObjectCallback = cb;
                });

            S3.prototype.getObject = getObjectSpy;

            aws.S3 = S3;

            result = lib.getConfig(state).then(success, failure);

            setTimeout(done);
        });

        it('should return a promise', function() {
            expect(result.then).toBeDefined();
        });

        it('should call getObject with params object', function() {
            expect(getObjectSpy).toHaveBeenCalledWith({
                Bucket: 'com.cinema6.lambda',
                Key: state.context.functionName + '/' +
                    state.context.functionVersion + '.json'
            }, jasmine.any(Function));
        });

        describe('when the config is returned', function() {
            beforeEach(function(done) {
                config = {
                    id: '123xyz',
                    params: true
                };

                response = {
                    Body: JSON.stringify(config)
                };

                getObjectCallback(null, response);

                setTimeout(done);
            });

            it('should add the config Body onto the state', function() {
                expect(state.config).toEqual(config);
            });

            it('should resolve the promise with the state', function() {
                expect(success).toHaveBeenCalledWith(state);
            });
        });

        describe('when the config fails to return', function() {
            beforeEach(function(done) {
                getObjectCallback('Error!', null);

                setTimeout(done);
            });

            it('should not add the config Body onto the state', function() {
                expect(state.config).not.toBeDefined();
            });

            it('should reject the promise', function() {
                expect(success).not.toHaveBeenCalledWith(state);
                expect(failure).toHaveBeenCalledWith('Error!');
            });
        });
    });

    describe('parseConfig(state)', function() {
        beforeEach(function() {
            decryptSpy = jasmine.createSpy('kms.decrypt()')
                .and.callFake(function(params, cb) {
                    decryptCallback = cb;
                });

            KMS.prototype.decrypt = decryptSpy;

            aws.KMS = KMS;
        });

        describe('when the state has no encrypted property', function() {
            beforeEach(function(done) {
                state.config = {};

                result = lib.parseConfig(state).then(success, failure);

                setTimeout(done);
            });

            it('should return a promise', function() {
                expect(result.then).toBeDefined();
            });

            it('should return the state immediately', function() {
                expect(success).toHaveBeenCalledWith(state);
            });
        });

        describe('when the state has an encrypted property', function() {
            beforeEach(function(done) {
                state.config = {
                    encrypted: '1234-abcd'
                };

                result = lib.parseConfig(state).then(success, failure);

                setTimeout(done);
            });

            it('should return a promise', function() {
                expect(result.then).toBeDefined();
            });

            it('should have passed the us-east-1 region to the KMS constructor', function() {
                expect(region).toBe('us-east-1');
            });

            it('should have called the decrypt method with a CiphertextBlob', function() {
                expect(decryptSpy).toHaveBeenCalledWith({
                    CiphertextBlob: jasmine.any(Buffer)
                }, jasmine.any(Function));
            });

            describe('when the decryption returns', function() {
                beforeEach(function(done) {
                    state.config.postmark = {
                        from: 'support@reelcontent.com',
                        template: 123
                    };

                    config = {
                        postmark: {
                            key: 'super-secret-key',
                            template: 999
                        }
                    };

                    response = {
                        Plaintext: JSON.stringify(config)
                    };

                    decryptCallback(null, response);

                    setTimeout(done);
                });

                it('should merge the decrypted config with the existing config', function() {
                    expect(state.config.postmark).toEqual({
                        from: 'support@reelcontent.com',
                        key: 'super-secret-key',
                        template: 999
                    });
                });

                it('should resolve the promise', function() {
                    expect(success).toHaveBeenCalledWith(state);
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('when the decryption fails', function() {
                beforeEach(function(done) {
                    state.config.postmark = {
                        from: 'support@reelcontent.com',
                        template: 123
                    };

                    decryptCallback('Error!', null);

                    setTimeout(done);
                });

                it('should not modify the existing config', function() {
                    expect(state.config.postmark).toEqual({
                        from: 'support@reelcontent.com',
                        template: 123
                    });
                });

                it('should reject the promise', function() {
                    expect(success).not.toHaveBeenCalledWith(state);
                    expect(failure).toHaveBeenCalledWith('Error!');
                });
            });
        });
    });

    describe('prepareModel(state)', function() {
        beforeEach(function(done) {
            state.event.TemplateModel = {
                name: 'Scott',
                email: 'scott@cinema6.com'
            };

            result = lib.prepareModel(state).then(success);

            setTimeout(done);
        });

        it('should return a promise', function() {
            expect(result.then).toBeDefined();
        });

        it('should set the model prop on the state', function() {
            expect(state.model).toEqual(state.event.TemplateModel);
            expect(success).toHaveBeenCalledWith(state);
        });
    });

    describe('sendPostmark(state)', function() {
        beforeEach(function(done) {
            sendEmailSpy = jasmine.createSpy('Client.sendEmailWithTemplate()')
                .and.callFake(function(config, cb) {
                    sendEmailCallback = cb;
                });

            PostmarkClient.prototype.sendEmailWithTemplate = sendEmailSpy;

            postmark.Client = PostmarkClient;

            state.config = {
                postmark: {
                    key: 'super-secret-key',
                    from: 'support@reelcontent.com',
                    template: 123
                }
            };

            state.model = {};
            state.event.To = 'scott@cinema6.com';

            result = lib.sendPostmark(state).then(success, failure);

            setTimeout(done);
        });

        it('should return a promise', function() {
            expect(result.then).toBeDefined();
        });

        it('should pass the postmark key to the constructor', function() {
            expect(key).toBe(state.config.postmark.key);
        });

        it('should call sendEmailWithTemplate method with config and callback', function() {
            expect(sendEmailSpy).toHaveBeenCalledWith({
                TemplateId: state.config.postmark.template,
                TemplateModel: state.model,
                InlineCss: true,
                From: state.config.postmark.from,
                To: state.event.To,
                TrackOpens: true
            }, jasmine.any(Function));
        });

        describe('when the email is successfully sent', function() {
            beforeEach(function(done) {
                sendEmailCallback(null, 'Success!');

                setTimeout(done);
            });

            it('should resolve the promise with the state', function() {
                expect(success).toHaveBeenCalledWith(state);
            });
        });

        describe('when the email fails to send', function() {
            beforeEach(function(done) {
                sendEmailCallback('Error!', null);

                setTimeout(done);
            });

            it('should reject the promise', function() {
                expect(success).not.toHaveBeenCalledWith(state);
                expect(failure).toHaveBeenCalledWith('Error!');
            });
        });
    });

    describe('sendHubspot(state)', function() {
        beforeEach(function(done) {
            result = lib.sendHubspot(state).then(success);

            setTimeout(done);
        });

        it('should return a promise', function() {
            expect(result.then).toBeDefined();
        });

        it('should immediately resolve the promise with the state', function() {
            expect(success).toHaveBeenCalledWith(state);
        });
    });

    describe('success(state)', function() {
        beforeEach(function() {
            state.context.succeed = jasmine.createSpy('context.succeed()');

            lib.success(state);
        });

        it('should call context.succeed()', function() {
            expect(state.context.succeed).toHaveBeenCalledWith('SUCCESS!');
        });
    });
});