module.exports = function(grunt) {
  

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

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
      
    }
  });
  grunt.registerTask('server',  [
    'browserify',
    'connect:server',
    'watch:scripts'
  ]
  );

};