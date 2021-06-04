'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('script.json'),
    concat: {
      dist: {
        src: [
          'src/index.js',
          'src/Commands.js',
            'src/Macros.js',
            'src/Wizard.js',
          'src/Paths.js',
          'src/State.js',
          'src/utils/index.js',
            'src/utils/Chat.js',
            'src/utils/Menu.js'
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
          AreasOfEffect: true,
          bshields: false,
          HtmlBuilder: false,
          MatrixMath: false,
          PathMath: false,
          VecMath: false,

          // Symbols defined by Roll20
          _: false,
          createObj: false,
          findObjs: false,
          getObj: false,
          globalconfig: true,
          playerIsGM: false,
          log: false,
          on: false,
          sendChat: false,
          state: true,
          toBack: true
        },
        nonbsp: true,
        nonew: true,
        strict: true,
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
