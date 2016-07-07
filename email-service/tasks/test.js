module.exports = function(grunt) {
    grunt.registerTask('test', 'lint and run unit tests', [
        'jshint:all',
        'jasmine_nodejs:unit'
    ]);
};