module.exports = function(grunt) {
  

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-envify');

  grunt.initConfig({
    connect: { 
      server:{
        options: {
          port: 9000,
          base: 'server/build',
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
      dist: {
        options: { 
          watch: true, 
           transform: [
              ["babelify",{ presets: ["react", "es2015"] }]
           ]
        },
        src: ['./src/index.js'],
        dest:  './server/build/index.js',
         
      }
      
    },
    uglify: {
      my_target: {
        files: {
          'dist/index.min.js': ['src/index.js']
        }
      }
    },
  });
  grunt.registerTask('s',  [
    'browserify',
    'connect:server',
    'watch:scripts'
  ]
  );
  grunt.registerTask('build',[
      'uglify',
      'envify'

    ])

};