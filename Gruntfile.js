module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  import connect from 'tasks/Connect'; 
  grunt.initConfig({
    connect: connect,
    watch: {
      scripts: {
        files: ['**/*.js']
      }
    }
  });


  grunt.registerTask('server',  [
    'connect' ,
    'watch'
  ]
  );


};