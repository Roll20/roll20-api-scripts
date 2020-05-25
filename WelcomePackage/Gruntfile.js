'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('script.json'),
    concat: {
      dist: {
        src: [
          'src/script.js'
        ],
        dest: '<%= pkg.version %>/<%= pkg.script %>'
      }
    },
    jshint: {
      dist: {
        src: ['src/**/*.js']
      },
      options: {
        eqeqeq: true,
        esversion: 6,
        freeze: true,
        globals: {
          // Symbols defined by API scripts
          WelcomePackage: true,
          HtmlBuilder: true,

          // Symbols defined by Roll20
          _: false,
          Campaign: false,
          createObj: false,
          findObjs: false,
          getObj: false,
          globalconfig: true,
          playerIsGM: false,
          log: false,
          on: false,
          sendChat: false,
          setTimeout: false,
          state: true,
          toBack: false,
          toFront: false
        },
        nonbsp: true,
        nonew: true,
        strict: true,
        sub: true,
        undef: true,
        unused: true
      }
    },
    'string-replace': {
      dist: {
        files: {
          '<%= pkg.version %>/<%= pkg.script %>': '<%= pkg.version %>/<%= pkg.script %>'
        }
      },
      options: {
        replacements: [
          {
            pattern: 'SCRIPT_VERSION',
            replacement: '<%= pkg.version %>'
          },

          // Convert unicode characters to HTML entities.
          {
            pattern: /./g,
            replacement: function(match) {
              let charCode = match.charCodeAt(0);
              if (charCode > 255)
                return '&#' + charCode + ';';
              else
                return match;
            }
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-string-replace');

  grunt.registerTask('default', ['jshint', 'concat', 'string-replace']);
};
