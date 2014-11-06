module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    processhtml: {
      options: {
        data: {
          message: 'Hello world!'
        }
      },
      dist: {
        files: {
          '../web-dist/index.html': ['index.html']
        }
      }
    },
    concat: {
      css: {
        src: [
          'css/*'
        ],
        dest: '../web-dist/css/combined.css'
      },
      js: {
        src: [
          'js/*'
        ],
        dest: '../web-dist/js/combined.js'
      }
    },
    cssmin: {
      css: {
        src: '../web-dist/css/combined.css',
        dest: '../web-dist/css/qwesta.min.css'
      }
    },
    uglify: {
      js: {
        files: {
          '../web-dist/js/qwesta.min.js': ['../web-dist/js/combined.js']
        }
      }
    },
    copy: {
      main: {
        files: [

          {expand: true, src: ['fonts/*'], dest: '../web-dist/', filter: 'isFile'},

          {expand: true, src: ['img/**'], dest: '../web-dist/'},
        ]
      }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['concat:css', 'cssmin:css', 'concat:js', 'uglify:js', 'processhtml', 'copy']);
};