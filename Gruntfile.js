module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    // var config = grunt.file.readYAML('gruntConfig.yaml');
    grunt.initConfig({

        jsbeautifier: {
            src: ['js/neighborhood-map.js', 'css/neighborhood-styles.css']

        },
        jshint: {
            options: {
                globals: {
                    "$": false,
                    "ko": false,
                    "google": false
                },
                node: true,
                loopfunc: true,
                browser: true
            },
            all: ['Gruntfile.js', 'js/neighborhood-map.js']

        },
        csslint: {
            all: ['css/neighborhood-styles.css']
        }
    });
    grunt.registerTask('default', [ 'jshint', 'csslint', 'jsbeautifier']);

};
