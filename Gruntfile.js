module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-envify');

    grunt.initConfig({
        connect: { 
            server:{
            options: {
                port: 9000,
                base: 'server/build/',
                livereload: true,
                open: {
                target: "http://localhost:9000"
                }
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
                    ["babelify",{ presets: ["react", "es2015"] }]
                 ]
            },
            src: ['./src/index.js'],
            dest:  './server/build/index.js',
             
            },
            module:{
            options: {
                watch: true,
                browserifyOptions: {
                standalone: 'adWidget'
                }, 
                 transform: [
                    ["babelify",{ presets: ["react", "es2015"] }],
                    ["envify", {
                    global: true,
                    NODE_ENV:"production",
                    RC_ENV: grunt.option('rc-env') || 'production'
                    }]
                 ]
            },
            src: ['./src/index.js'],
            dest:  './dist/index.js',

            }
            
        },
        uglify: {
            my_target: {
            files: {
                'dist/index.min.js': ['dist/index.js']
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
            cwd: 'dist/',
            src: ['index.min.js'],
            dest: 'dist/'
            }]
            },
        }
    });
    grunt.registerTask('s',  [
    'browserify:server',
    'connect:server',
    'watch:scripts'
    ]
    );
    grunt.registerTask('build',[
    'browserify:module',
    'uglify',
    'compress:build'
    ]);
    grunt.registerTask('module',[
    'browserify:module',
    'uglify'
    ]);

};