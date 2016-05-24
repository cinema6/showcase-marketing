module.exports = function(grunt) {
  

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
   
  grunt.initConfig({
    connect: { 
      server:{
        options: {
          port: 9000,
          base: 'src',
          livereload: true,
          open: {
            target: "http://localhost:9000"
          }
        }
      }
  },
    watch: {
      scripts: {
        files: ['js/**/*.js'],
        tasks: ['server']
      }
    },
    babel:{
      options: {
            sourceMap: true,
            presets: ['babel-preset-es2015']
      },
      dist: {
        files: {
          'index.js': 'src/index.js'
        }
      }
    }
  });


  grunt.registerTask('server',  [
    'connect' ,
    'babel',
    'watch'
  ]
  );


};