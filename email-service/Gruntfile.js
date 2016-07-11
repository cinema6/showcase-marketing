
module.exports = function(grunt) {
    grunt.initConfig({
        encrypt: {
            options: {
                KeyId: '96fbe2e1-65ea-41f1-8523-dd06d9be1d06'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'src/**/*.js'
            ]
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: '.js',
                stopOnFailure: false
            },
            unit: {
                specs: 'tests/unit/**/*.ut.js',
                options: {
                    reporters: {
                        console: {
                            colors: true,
                            indent: true
                        },
                        junit: {
                            savePath: 'reports',
                            filePrefix: 'unit_test_results',
                        }
                    }
                }
            }
        },
        watch: {
            files: [
                'src/**/*.js',
                'tests/**/*.js'
            ],
            tasks: [
                'test'
            ],
            options: {
                spawn: false
            }
        },
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
};