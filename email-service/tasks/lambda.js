var path = require('path');
var fs = require('fs-extra');

module.exports = function(grunt) {
    function runLambda(name, filePath, doneFunc) {
        var lambdaBase = path.join(filePath, '..'),
            mockBase = path.join(lambdaBase, '../..', 'mocks'),
            env, evt, lambda, key, context,
            started = Date.now();

        if (fs.existsSync(path.join(process.env.HOME, '.aws.json'))){
            env = fs.readJsonSync(path.join(process.env.HOME, '.aws.json'));

            process.env.AWS_ACCESS_KEY_ID = env.accessKeyId;
            process.env.AWS_SECRET_ACCESS_KEY = env.secretAccessKey;
        }

        if (fs.existsSync(path.join(lambdaBase, 'mocks', 'env.json'))){
            env = fs.readJsonSync(path.join(lambdaBase, 'mocks', 'env.json'));

            for (key in env) {
                process.env[key] = env[key];
            }
        }

        if (fs.existsSync(path.join(mockBase, name, 'event.json'))){
            evt = fs.readJsonSync(path.join(mockBase, name, 'event.json'));
        }

        delete require.cache[path.resolve('.', filePath)];

        lambda = require(path.resolve('.', filePath));

        context = {
            functionName : 'showcaseMarketing' + name.charAt(0).toUpperCase() + name.slice(1),
            functionVersion : '$LATEST',
            getRemainingTimeInMillis : function() {
                return Math.max(30000 - (Date.now() - started),0);
            },
            succeed : function(data) {
                grunt.log.writelns(lambdaBase + ' Completed: ' + JSON.stringify(data));

                if (doneFunc) {
                    doneFunc(true);
                }
            },
            fail: function(err) {
                grunt.log.errorlns(lambdaBase + ' ' + err);

                if (doneFunc) {
                    doneFunc(false);
                }
            },
            done: function(err,data){
                if (err) {
                    this.fail(err);
                } else {
                    this.succeed(data);
                }
           }
        };

        lambda.handler(evt, context);
    }

    function buildLambda(funcName, filePath, doneFunc) {
        var exec = require('child_process').exec,
            zip = new require('adm-zip')(),
            zipPath;

        zipPath = path.join('dist', funcName + (grunt.option('release') ? '-' + grunt.config().pkg.version : '') + '.zip');

        grunt.file.delete(zipPath);

        grunt.log.writelns('Build: ', zipPath);

        grunt.file.expand(path.join(filePath, '..', '*.js')).forEach(function(file){
            grunt.log.writelns('Adding: ', file);
            zip.addLocalFile(file);
            grunt.log.writelns('Added: ', file);
        });

        grunt.log.writelns('Adding: package.json');
        grunt.file.copy('package.json', 'dist/' + funcName + '/package.json');
        zip.addLocalFile('dist/' + funcName + '/package.json');
        grunt.log.writelns('Added: package.json');

        exec('cd dist/' + funcName + ' && npm install --production',
            function(error, stdout, stderr) {
                if (error) {
                    grunt.log.errorlns(funcName, ': ', error);
                }
                if (stderr) {
                    grunt.log.errorlns(funcName, ': ', stderr);
                }
                if (stdout) {
                    grunt.log.writelns(funcName, ': ', stdout);
                }

                if (!error && !stderr) {
                    grunt.log.writelns('Zipping: ', zipPath);

                    zip.addLocalFolder('dist/' + funcName + '/node_modules', 'node_modules', new RegExp(/^((?!aws-sdk).)*$/));

                    fs.ensureDirSync('dist');

                    zip.writeZip(zipPath);

                    grunt.log.writelns('Zipped: ', zipPath);
                }

                grunt.file.delete('dist/' + funcName);
            });
    }

    grunt.registerTask('lambda', function(cmd) {
        var name  = grunt.option('name');

        if (!name) {
            grunt.fail.fatal('--function param is required!');
            return false;
        }

        if (cmd === 'run') {
            return runLambda(name, path.join('.', 'src', name, 'index.js'), this.async());
        } else if (cmd === 'build') {
            return buildLambda(name, path.join('.', 'src', name, 'index.js'), this.async());
        }

        grunt.fail.fatal('Unrecognized command: ', cmd);
        return false;
    });
};
