var path = require('path');
var aws = require('aws-sdk');
var kms = new aws.KMS({ region : 'us-east-1' });

module.exports = function(grunt) {
    grunt.registerTask('decrypt', 'Decrypt using AWS Key Management Service (KMS)', function(cipher) {
        var awsConfig = (grunt.file.isFile(process.env.HOME,'.aws.json') &&
                grunt.file.readJSON(path.resolve(process.env.HOME,'.aws.json'))) || {};

        var done = this.async();

        if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
            grunt.fail.warn('AWS credentials are required');
            return done(false);
        }

        if (!cipher) {
            grunt.fail.warn('A cipher text blob is required');
            return done(false);
        }

        // add credentials to environment
        process.env.AWS_ACCESS_KEY_ID = awsConfig.accessKeyId;
        process.env.AWS_SECRET_ACCESS_KEY = awsConfig.secretAccessKey;

        kms.decrypt({
            CiphertextBlob: new Buffer(cipher, 'base64')
        }, function(err, data){
            if (err) {
                grunt.fail.fatal(err);
                return done(false);
            }

            if (data) {
                console.log(data.Plaintext.toString());
                return done(true);
            }
        });
    });

    grunt.registerTask('encrypt', 'Encrypt using AWS Key Management Service (KMS)', function() {
        var awsConfig = (grunt.file.isFile(process.env.HOME,'.aws.json') &&
                grunt.file.readJSON(path.resolve(process.env.HOME,'.aws.json'))) || {},
            filePath = grunt.option('file'),
            options = this.options(),
            key = options.KeyId,
            done = this.async();

        var content;

        if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
            grunt.fail.warn('AWS credentials are required');
            return done(false);
        }

        if (!filePath || !grunt.file.isFile(path.resolve(__dirname, '..', filePath))) {
            grunt.fail.warn('A path to a valid file is required');
            return done(false);
        }

        if (!key) {
            grunt.fail.warn('An AWS Key Management Service (KMS) key is required');
            return done(false);
        }

        // add credentials to environment
        process.env.AWS_ACCESS_KEY_ID = awsConfig.accessKeyId;
        process.env.AWS_SECRET_ACCESS_KEY = awsConfig.secretAccessKey;

        // resolve file path
        filePath = path.resolve(__dirname, '..', filePath);

        if ((/\.json$/).test(filePath)) {
            // file is json then read it and stringify it
            content = grunt.file.readJSON(filePath);
            content = JSON.stringify(content);
        } else {
            // otherwise just read it
            content = grunt.file.read(filePath);
        }

        kms.encrypt({
            KeyId: key,
            Plaintext: new Buffer(content)
        }, function(err, data) {
            if (err) {
                grunt.fail.fatal(err);
                return done(false);
            }

            if (data) {
                console.log(data.CiphertextBlob.toString('base64'));
                return done(true);
            }
        });
    });
};