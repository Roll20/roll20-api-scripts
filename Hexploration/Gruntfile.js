'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('script.json'),
    concat: {
      dist: {
        src: [
          'src/index.js',
          'src/HexagonTile.js',
          'src/State.js',
          'src/main.js'
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
