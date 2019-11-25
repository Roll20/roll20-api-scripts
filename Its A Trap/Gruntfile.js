'use strict';

var VERSION = '3.0';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('script.json'),
    concat: {
      dist: {
        src: [
          'src/State.js',
          'src/main.js',
          'src/TrapEffect.js',
          'src/LineOfSight.js',
          'src/Wizard.js',
          'src/TrapTheme.js',
          'src/D20TrapTheme.js',
          'src/D20TrapTheme4E.js',
          'src/DefaultTrapTheme.js'
        ],
        dest: '<%= pkg.version %>/<%= pkg.script %>'
      }
    },
    jshint: {
      dist: {
        src: ['src/**/*.js']
      },
      options: {
        esversion: 6,
        globals: {
          DefaultTrapTheme: true,
          D20TrapTheme: true,
          D20TrapTheme4E: true,
          ItsATrap: true,
          ItsATrapCreationWizard: true,
          LineOfSight: true,
          TrapTheme: true
        },
        strict: true
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
