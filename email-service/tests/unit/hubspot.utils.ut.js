describe('Hubspot Utility', function() {
    var lib, q, https, querystring;
    var success, failure;
    var config, user, body;
    var hubspotSpy, hubspotCallback;
    var requestErrorCallback, requestObject;

    beforeEach(function() {
        lib = require('../../src/checklist/hubspot');
        q = require('q');
        https = require('https');
        querystring = require('querystring');

        success = jasmine.createSpy('success()');
        failure = jasmine.createSpy('failure()');

        user = {
            firstName: 'Scott',
            lastName: 'Munson',
            email: 'smunson@reelcontent.com'
        };
        config = {
            portal: 12345,
            form: 'abc-123',
            cookie: null,
            model: user
        };
    });

    afterEach(function() {
        lib = null;
        q = null;
        https = null;
        querystring = null;
        success = null;
        failure = null;
        config = null;
        user = null;
        body = null;
        hubspotSpy = null;
        hubspotCallback = null;
        requestErrorCallback = null;
        requestObject = null;
    });

    describe('send(config)', function() {
        beforeEach(function() {
            spyOn(querystring, 'stringify').and.callThrough();

            hubspotSpy = jasmine.createSpy('https.request()')
                .and.callFake(function(options, cb) {
                    hubspotCallback = cb;

                    requestObject = {
                        on: jasmine.createSpy('request.on()')
                            .and.callFake(function(eventName, cb) {
                                requestErrorCallback = cb;
                            }),
                        write: jasmine.createSpy('request.write()'),
                        end: jasmine.createSpy('request.end()')
                    };

                    return requestObject;
                });

            https.request = hubspotSpy;
        });

        describe('when there is a hubspotutk cookie', function() {
            beforeEach(function(done) {
                body = querystring.stringify({
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                    hs_context: JSON.stringify({ hutk: 'hb123'})
                });
                querystring.stringify.calls.reset();

                config.cookie = 'hb123';

                result = lib.send(config).then(success, failure);

                setTimeout(done);
            });

            it('should return a promise', function() {
                expect(result.then).toBeDefined();
            });

            it('should call querystring.stringify()', function() {
                expect(querystring.stringify).toHaveBeenCalledWith({
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                    hs_context: JSON.stringify({ hutk: 'hb123'})
                });
            });

            it('should send an https request', function() {
                expect(hubspotSpy).toHaveBeenCalledWith({
                    host: 'forms.hubspot.com',
                    port: 443,
                    method: 'POST',
                    path: '/uploads/form/v2/' + config.portal + '/' + config.form,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': body.length
                    }
                }, hubspotCallback);

                expect(requestObject.on).toHaveBeenCalledWith('error', requestErrorCallback);

                expect(requestObject.write).toHaveBeenCalledWith(body);

                expect(requestObject.end).toHaveBeenCalled();
            });

            describe('when the error handler is called back', function() {
                beforeEach(function(done) {
                    requestErrorCallback('Problem!');

                    setTimeout(done);
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith('Problem!');
                });
            });

            describe('when the request handler is called back', function() {
                describe('when response is 204', function() {
                    beforeEach(function(done) {
                        hubspotCallback({ statusCode: 204 });

                        setTimeout(done);
                    });

                    it('should resolve promise with response', function() {
                        expect(success).toHaveBeenCalledWith({ statusCode: 204 });
                    });
                });

                describe('when response is 302', function() {
                    beforeEach(function(done) {
                        hubspotCallback({ statusCode: 302 });

                        setTimeout(done);
                    });

                    it('should resolve promise with response', function() {
                        expect(success).toHaveBeenCalledWith({ statusCode: 302 });
                    });
                });

                describe('when response is not 204 or 302', function() {
                    beforeEach(function(done) {
                        hubspotCallback({ statusCode: 400 });

                        setTimeout(done);
                    });

                    it('should resolve promise with response', function() {
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalledWith('Hubspot request failed, status code: 400');
                    });
                });
            });
        });

        describe('when there is not a hubspotutk cookie', function() {
            beforeEach(function(done) {
                body = querystring.stringify({
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                    hs_context: JSON.stringify({})
                });
                querystring.stringify.calls.reset();

                config.cookie = null;

                result = lib.send(config).then(success, failure);

                setTimeout(done);
            });

            it('should return a promise', function() {
                expect(result.then).toBeDefined();
            });

            it('should call querystring.stringify()', function() {
                expect(querystring.stringify).toHaveBeenCalledWith({
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                    hs_context: JSON.stringify({})
                });
            });
        });
    });
});