describe('Checklist Lambda Function', function() {
    var lib, postmark, hubspot, aws, q;

    var state, event, context;

    var deferreds, success, failure, result,
        response, config, region, key;

    var getObjectSpy, getObjectCallback,
        decryptSpy, decryptCallback;

    function S3() {}

    function KMS(config) {
        region = config.region;
    }

    beforeEach(function() {
        lib = require('../../src/checklist');
        postmark = require('../../src/checklist/postmark');
        hubspot = require('../../src/checklist/hubspot');
        aws = require('aws-sdk');
        q = require('q');

        success = jasmine.createSpy('success()');
        failure = jasmine.createSpy('failure()');

        event = {
            body: {}
        };
        context = {
            functionName: 'checklistLambda',
            functionVersion: '$LATEST'
        };
        state = {
            event: event,
            context: context
        };

        deferreds = {
            validate: q.defer(),
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
        postmark = null;
        hubspot = null;
        aws = null;
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
    });

    describe('handler(event, context, callback)', function() {
        beforeEach(function(done) {
            state = {};

            context.fail = jasmine.createSpy('context.fail()');

            ['validate','getConfig','parseConfig','prepareModel','sendPostmark',
            'sendHubspot','success'].forEach(function(prop) {
                spyOn(lib, prop).and.returnValue(deferreds[prop].promise);
            });

            lib.handler(event, context);

            setTimeout(done);
        });

        it('should call validate with the state', function() {
            expect(lib.validate).toHaveBeenCalledWith({
                started: jasmine.any(Number),
                event: event,
                context: context
            });
        });

        describe('when validate resolves', function() {
            beforeEach(function(done) {
                deferreds.validate.resolve(state);

                setTimeout(done);
            });

            it('should call getConfig with the state', function() {
                expect(lib.getConfig).toHaveBeenCalledWith(state);
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
                                        deferreds.success.reject({ message: 'Bad!' });

                                        setTimeout(done);
                                    });

                                    it('should pass error message to context.fail()', function() {
                                        expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
                                    });
                                });
                            });

                            describe('when sendHubspot fails', function() {
                                beforeEach(function(done) {
                                    deferreds.sendHubspot.reject({ message: 'Bad!' });

                                    setTimeout(done);
                                });

                                it('should pass error message to context.fail()', function() {
                                    expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
                                });

                                it('should not call success', function() {
                                    expect(lib.success).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe('when sendPostmark fails', function() {
                            beforeEach(function(done) {
                                deferreds.sendPostmark.reject({ message: 'Bad!' });

                                setTimeout(done);
                            });

                            it('should pass error message to context.fail()', function() {
                                expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
                            });

                            it('should not call sendHubspot', function() {
                                expect(lib.sendHubspot).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when prepareModel fails', function() {
                        beforeEach(function(done) {
                            deferreds.prepareModel.reject({ message: 'Bad!' });

                            setTimeout(done);
                        });

                        it('should pass error message to context.fail()', function() {
                            expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
                        });

                        it('should not call sendPostmark', function() {
                            expect(lib.sendPostmark).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('when parseConfig fails', function() {
                    beforeEach(function(done) {
                        deferreds.parseConfig.reject({ message: 'Bad!' });

                        setTimeout(done);
                    });

                    it('should pass error message to context.fail()', function() {
                        expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
                    });

                    it('should not call prepareModel', function() {
                        expect(lib.prepareModel).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when getConfig fails', function() {
                beforeEach(function(done) {
                    deferreds.getConfig.reject({ message: 'Bad!' });

                    setTimeout(done);
                });

                it('should pass error message to context.fail()', function() {
                    expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
                });

                it('should not call parseConfig', function() {
                    expect(lib.parseConfig).not.toHaveBeenCalled();
                });
            });
        });

        describe('when validate fails', function() {
            beforeEach(function(done) {
                deferreds.validate.reject({ message: 'Bad!' });

                setTimeout(done);
            });

            it('should pass error message to context.fail()', function() {
                expect(context.fail).toHaveBeenCalledWith('Error: Bad!');
            });

            it('should not call parseConfig', function() {
                expect(lib.getConfig).not.toHaveBeenCalled();
            });
        });
    });

    describe('validate(state)', function() {
        describe('when required props are set', function() {
            beforeEach(function(done) {
                state.event.body = {
                    appName: 'My App',
                    user: {
                        firstName: 'Scott',
                        lastName: 'Munson',
                        email: 'smunson@reelcontent.com'
                    },
                    checklist: []
                };

                result = lib.validate(state).then(success, failure);

                setTimeout(done);
            });

            it('should resolve with the state', function() {
                expect(success).toHaveBeenCalledWith(state);
            });
        });

        describe('when required props are missing', function() {
            beforeEach(function(done) {
                state.event.body = {
                    appName: 'My App',
                    user: {
                        firstName: undefined,
                        lastName: 'Munson',
                        email: 'smunson@reelcontent.com'
                    },
                    checklist: []
                };

                result = lib.validate(state).then(success, failure);

                setTimeout(done);
            });

            it('should resolve with the state', function() {
                expect(success).not.toHaveBeenCalledWith(state);
                expect(failure).toHaveBeenCalledWith({
                    message: 'Missing required fields'
                });
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
        var expectedChecklist;

        beforeEach(function() {
            state.event.body.appName = 'My App';

            state.event.body.user = {
                firstName: 'Scott',
                lastName: 'Munson',
                email: 'smunson@reelcontent.com'
            };

            state.event.body.checklist = [
                {
                    title: 'Section 1',
                    items: [
                        {
                            title: 'Task 1',
                            done: true
                        },
                        {
                            title: 'Task 2',
                            done: false
                        },
                        {
                            title: 'Task 3',
                            done: true
                        }
                    ]
                },
                {
                    title: 'Section 2',
                    items: [
                        {
                            title: 'Task 4',
                            done: true
                        },
                        {
                            title: 'Task 5',
                            done: true
                        }
                    ]
                },
                {
                    title: 'Section 3',
                    items: [
                        {
                            title: 'Task 6',
                            done: false
                        }
                    ]
                }
            ];

            expectedChecklist = [
                {
                    title: 'Section 1',
                    status: '2/3',
                    completed: [
                        {title: 'Task 1', done: true},
                        {title: 'Task 3', done: true}
                    ],
                    pending: [
                        {title: 'Task 2', done: false}
                    ]
                },
                {
                    title: 'Section 2',
                    status: '2/2',
                    completed: [
                        {title: 'Task 4', done: true},
                        {title: 'Task 5', done: true}
                    ],
                    pending: [
                        {title: 'None'}
                    ]
                },
                {
                    title: 'Section 3',
                    status: '0/1',
                    completed: [
                        {title: 'None'}
                    ],
                    pending: [
                        {title: 'Task 6', done: false}
                    ]
                }
            ];
        });

        describe('when there are no recipients', function() {
            beforeEach(function() {
                state.event.body.recipients = undefined;
            });

            describe('when the user.sendCopy flag is false', function() {
                beforeEach(function(done) {
                    state.event.body.user.sendCopy = false;

                    result = lib.prepareModel(state).then(success);

                    setTimeout(done);
                });

                it('should have an empty model, sending nothign to postmark', function() {
                    expect(success).toHaveBeenCalled();
                    expect(state.model).toEqual([]);
                });
            });

            describe('when the user.sendCopy flag is true', function() {
                beforeEach(function(done) {
                    state.event.body.user.sendCopy = true;

                    result = lib.prepareModel(state).then(success);

                    setTimeout(done);
                });

                it('should include a model item for the user only', function() {
                    expect(success).toHaveBeenCalled();
                    expect(state.model.length).toBe(1);
                    expect(state.model[0]).toEqual({
                        to: 'smunson@reelcontent.com',
                        data: {
                            user: 'Scott Munson',
                            name: 'Scott Munson',
                            app: 'My App',
                            finished: 4,
                            total: 6,
                            checklist: expectedChecklist
                        }
                    });
                });
            });
        });

        describe('when there are recipients', function() {
            beforeEach(function() {
                state.event.body.recipients = [
                    {
                        name: 'Dhaval Jani',
                        email: 'dhaval@reelcontent.com'
                    },
                    {
                        name: 'Josh Minzner',
                        email: 'josh@cinema6.com'
                    }
                ];
            });

            describe('when the user.sendCopy flag is false', function() {
                beforeEach(function(done) {
                    state.event.body.user.sendCopy = false;

                    result = lib.prepareModel(state).then(success);

                    setTimeout(done);
                });

                it('should not include a model for the user', function() {
                    expect(success).toHaveBeenCalled();
                    expect(state.model.length).toEqual(2);
                    expect(state.model[0]).toEqual({
                        to: 'dhaval@reelcontent.com',
                        data: {
                            user: 'Scott Munson',
                            name: 'Dhaval Jani',
                            app: 'My App',
                            finished: 4,
                            total: 6,
                            checklist: expectedChecklist
                        }
                    });
                    expect(state.model[1]).toEqual({
                        to: 'josh@cinema6.com',
                        data: {
                            user: 'Scott Munson',
                            name: 'Josh Minzner',
                            app: 'My App',
                            finished: 4,
                            total: 6,
                            checklist: expectedChecklist
                        }
                    });
                });
            });

            describe('when the user.sendCopy flag is true', function() {
                beforeEach(function(done) {
                    state.event.body.user.sendCopy = true;

                    result = lib.prepareModel(state).then(success);

                    setTimeout(done);
                });

                it('should include a model item for each recipient plus the user', function() {
                    expect(success).toHaveBeenCalled();
                    expect(state.model.length).toBe(3);
                    expect(state.model[0]).toEqual({
                        to: 'dhaval@reelcontent.com',
                        data: {
                            user: 'Scott Munson',
                            name: 'Dhaval Jani',
                            app: 'My App',
                            finished: 4,
                            total: 6,
                            checklist: expectedChecklist
                        }
                    });
                    expect(state.model[1]).toEqual({
                        to: 'josh@cinema6.com',
                        data: {
                            user: 'Scott Munson',
                            name: 'Josh Minzner',
                            app: 'My App',
                            finished: 4,
                            total: 6,
                            checklist: expectedChecklist
                        }
                    });
                    expect(state.model[2]).toEqual({
                        to: 'smunson@reelcontent.com',
                        data: {
                            user: 'Scott Munson',
                            name: 'Scott Munson',
                            app: 'My App',
                            finished: 4,
                            total: 6,
                            checklist: expectedChecklist
                        }
                    });
                });
            });
        });
    });

    describe('sendPostmark(state)', function() {
        beforeEach(function(done) {
            spyOn(postmark, 'send').and.returnValue(deferreds.sendPostmark.promise);

            state.config = {
                postmark: {
                    key: 'super-secret-key',
                    from: 'support@reelcontent.com',
                    template: 123
                }
            };

            state.model = [
                {
                    to: 'smunson@reelcontent.com',
                    data: {}
                },
                {
                    to: 'scott@cinema6.com',
                    data: {}
                }
            ];

            result = lib.sendPostmark(state).then(success, failure);

            setTimeout(done);
        });

        it('should return a promise', function() {
            expect(result.then).toBeDefined();
        });

        it('should call postmark.send() method with config for each model item', function() {
            expect(postmark.send).toHaveBeenCalledWith({
                key: state.config.postmark.key,
                template: state.config.postmark.template,
                from: state.config.postmark.from,
                to: state.model[0].to,
                model: state.model[0].data
            });

            expect(postmark.send).toHaveBeenCalledWith({
                key: state.config.postmark.key,
                template: state.config.postmark.template,
                from: state.config.postmark.from,
                to: state.model[1].to,
                model: state.model[1].data
            });
        });

        describe('when the email is successfully sent', function() {
            beforeEach(function(done) {
                deferreds.sendPostmark.resolve('Success!');

                setTimeout(done);
            });

            it('should resolve the promise with the state', function() {
                expect(success).toHaveBeenCalledWith(state);
            });
        });

        describe('when the email fails to send', function() {
            beforeEach(function(done) {
                deferreds.sendPostmark.reject('Error!');

                setTimeout(done);
            });

            it('should reject the promise', function() {
                expect(success).not.toHaveBeenCalledWith(state);
                expect(failure).toHaveBeenCalledWith('Error!');
            });
        });
    });

    describe('sendHubspot(state)', function() {
        beforeEach(function() {
            spyOn(hubspot, 'send').and.returnValue(deferreds.sendHubspot.promise);

            state.config = {
                hubspot: {
                    portal: 12345,
                    form: 'abc-123'
                }
            };
            state.event = {
                params: {
                    header: {
                        Cookie: 'something=else'
                    }
                },
                body: {
                    user: {
                        firstName: 'Scott',
                        lastName: 'Munson',
                        email: 'smunson@reelcontent.com'
                    }
                }
            };
        });

        describe('when hubspotLead flag is set to false', function() {
            beforeEach(function(done) {
                state.event.body.user.hubspotLead = false;

                result = lib.sendHubspot(state).then(success);

                setTimeout(done);
            });

            it('should return a promise', function() {
                expect(result.then).toBeDefined();
            });

            it('should immediately resolve the promise with the state', function() {
                expect(success).toHaveBeenCalledWith(state);
                expect(hubspot.send).not.toHaveBeenCalled();
            });
        });

        describe('when hubspotLead flag is set to true', function() {
            beforeEach(function() {
                state.event.body.user.hubspotLead = true;
            });

            describe('when there is a hubspotutk cookie', function() {
                beforeEach(function(done) {
                    state.event.params.header.Cookie = 'something=else;hubspotutk=hb123;more=coookies;';

                    result = lib.sendHubspot(state).then(success, failure);

                    setTimeout(done);
                });

                it('should return a promise', function() {
                    expect(result.then).toBeDefined();
                });

                it('should call hubspot.send() with configuration', function() {
                    expect(hubspot.send).toHaveBeenCalledWith({
                        portal: state.config.hubspot.portal,
                        form: state.config.hubspot.form,
                        cookie: 'hb123',
                        model: state.event.body.user
                    });
                });

                describe('when the send() fails', function() {
                    beforeEach(function(done) {
                        deferreds.sendHubspot.reject('Problem!');

                        setTimeout(done);
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalledWith('Problem!');
                    });
                });

                describe('when the send() succeeds', function() {
                    beforeEach(function(done) {
                        deferreds.sendHubspot.resolve('Problem!');

                        setTimeout(done);
                    });

                    it('should resolve promise with state', function() {
                        expect(success).toHaveBeenCalledWith(state);
                    });
                });
            });

            describe('when there is not a hubspotutk cookie', function() {
                beforeEach(function(done) {
                    state.event.params.header.Cookie = 'something=else';

                    result = lib.sendHubspot(state).then(success, failure);

                    setTimeout(done);
                });

                it('should return a promise', function() {
                    expect(result.then).toBeDefined();
                });

                it('should call hubspot.send() with configuration', function() {
                    expect(hubspot.send).toHaveBeenCalledWith({
                        portal: state.config.hubspot.portal,
                        form: state.config.hubspot.form,
                        cookie: null,
                        model: state.event.body.user
                    });
                });
            });
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