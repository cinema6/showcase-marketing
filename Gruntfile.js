module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-envify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-git-assist');
    grunt.loadNpmTasks('grunt-c6-util');

    var fs = require('fs'),
        path = require('path'),
        aws_auth;

    if ((process.env.HOME) && (fs.existsSync(path.join(process.env.HOME,'.aws.json')))){
        aws_auth = grunt.file.readJSON(
                path.join(process.env.HOME,'.aws.json')
        );
    }

    grunt.initConfig({
        connect: { 
            server:{
                options: {
                    port: 9000,
                    base: 'server/build/',
                    livereload: true,
                    open: {
                        target: 'http://localhost:9000'
                    }
                }
            }
        },
        s3:{
            options: {
                key: aws_auth.accessKeyId,
                secret: aws_auth.secretAccessKey,
                access: 'public-read'
            },
            staging: {
                options: {
                    bucket: 'c6.dev'
                },
                upload: [
                    {
                        src: [
                            'dist/<%= _version %>/*.js'
                        ],
                        dest: 'ext/showcase-marketing/',
                        rel: 'dist/',
                        options: {
                            CacheControl: 'max-age=31556926',
                            ContentEncoding: 'gzip'
                        }
                    },
                ]
            },
            production: {
                options: {
                    bucket: 'c6.ext'
                },
                upload: [
                    {
                        src: [
                            'dist/<%= _version %>/*.js'
                        ],
                        dest: 'showcase-marketing/',
                        rel: 'dist/',
                        options: {
                            CacheControl: 'max-age=31556926',
                            ContentEncoding: 'gzip'
                        }
                    },
                ]
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc.json'
            },
            code: ['src/**/*.js']
        },
        git_describe_tags:{
            options: {
                config: function(version) {
                    grunt.config.set('_version', version);
                }
            }
        },
        watch: {
            scripts: {
                files: ['server/build/**/*.js'],
                options:{
                    reload: true
                }
            }
        },
        browserify: {
            server: {
                options: { 
                    watch: true,
                    browserifyOptions: {
                        standalone: 'adWidget'
                    }, 
                    transform: [
                    ['babelify',{ presets: ['react', 'es2015'] }]
                    ]
                },
                src: ['./src/index.js'],
                dest:  './server/build/index.js'             
            },
            module:{
                options: {
                    watch: true,
                    browserifyOptions: {
                        standalone: 'adWidget'
                    }, 
                    transform: [
                    ['babelify',{ presets: ['react', 'es2015'] }],
                    ['envify', {
                        global: true,
                        NODE_ENV:'production',
                        RC_ENV: grunt.option('rc-env') || 'production'
                    }]
                    ]
                },
                src: ['./src/index.js'],
                dest:  './dist/<%= _version %>/index.js'
            }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/index.min.js': ['dist/index.js']
                }
            },
            build:{
                files: {
                    './dist/<%= _version %>/index.min.js': ['dist/<%= _version %>/index.js']
                }  
            }
        },
        compress: {
            options: {
                mode: 'gzip',
                level: 9
            },
            build: {
                files: [{
                    expand: true,
                    src: 'dist/<%= _version %>/index.min.js',
                    dest: './index.min.js'
                }]
            }
        }
    });
    grunt.registerTask('s',  [
        'browserify:server',
        'connect:server',
        'watch:scripts'
    ]
    );
    grunt.registerTask('build',[
        'git_describe_tags',
        'browserify:module',
        'uglify:build',
        'compress'
    ]);
    grunt.registerTask('module',[
        'git_describe_tags',
        'browserify:module',
        'uglify'
    ]);
    grunt.registerTask('test', [
        'eslint:code'
    ]);
    grunt.registerTask('publish:staging', [
        'build',
        's3:staging'
    ]);
    grunt.registerTask('publish:production', [
        'build',
        's3:production'
    ]);
};
