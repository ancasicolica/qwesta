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
          '../web-dist/index.html': ['index.html'],
          '../web-dist/iframe.html': ['iframe.html']
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
          'i18n/angular-locale_de-ch.js',
          'js/angular-pickadate.js',
          'js/charts.js',
          'js/date.js',
          'js/qwestactrl.js'
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
          {expand: true, src: ['*.php'], dest: '../web-dist/', filter: 'isFile'},
          {expand: true, src: ['fonts/*'], dest: '../web-dist/', filter: 'isFile'},
          {expand: true, src: ['img/**'], dest: '../web-dist/'},
          {expand: true, src: ['i18n/**'], dest: '../web-dist/'},
          {expand: true, src: ['.htaccess'], dest: '../web-dist/'},
          {expand: true, src: ['js/angular-pickadate.min.js', 'js/currentdatactrl.js'], dest: '../web-dist', filter: 'isFile'}
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
