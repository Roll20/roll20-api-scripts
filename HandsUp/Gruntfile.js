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
          'src/utils/index.js',
            'src/utils/Chat.js',
            'src/utils/Colors.js'
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
          HandsUp: true,

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
          toBack: true,

          // Symbols that are part of ES6, but aren't recognized by jshint
          clearInterval: false,
          setInterval: false
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
            pattern: /[\u{00FF}-\u{FFFFF}]/gu,
            replacement: function(match) {
              if (match.length === 2) {
                let highSurrogate = match.charCodeAt(0);
                let lowSurrogate = match.charCodeAt(1);
                let astralCodePoint = (highSurrogate - 0xD800) * 0x400 + lowSurrogate - 0xDC00 + 0x10000;
                return '&#' + astralCodePoint + ';';
              }
              else if (match.length === 1) {
                let charCode = match.charCodeAt(0);
                return '&#' + charCode + ';';
              }
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
