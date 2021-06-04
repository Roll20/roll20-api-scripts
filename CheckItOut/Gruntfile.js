'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('script.json'),
    concat: {
      dist: {
        src: [
          'src/index.js',
          'src/Commands.js',
          'src/GarbageCollection.js',
          'src/Macros.js',
          'src/ObjProps.js',
          'src/State.js',
          'src/Wizard.js',
          'src/themes/index.js',
            'src/themes/CheckItOutTheme.js',
            'src/themes/impl/index.js',
              'src/themes/impl/D20System.js',
                'src/themes/impl/DnD3p5e.js',
                  'src/themes/impl/DnD3p5eSheet.js',
                'src/themes/impl/DnD4e.js',
                  'src/themes/impl/DnD4eSheet.js',
                  'src/themes/impl/GammaWorld7E.js',
                    'src/themes/impl/GammaWorld7ESheet.js',
                'src/themes/impl/DnD5e.js',
                  'src/themes/impl/DnD5eCommunity.js',
                  'src/themes/impl/DnD5eRoll20.js',
                  'src/themes/impl/DnD5eShaped.js',
                'src/themes/impl/Pathfinder.js',
                  'src/themes/impl/PathfinderRoll20.js',
                  'src/themes/impl/PathfinderCommunity.js',
                  'src/themes/impl/PathfinderSimple.js',
                  'src/themes/impl/Starfinder.js',
                    'src/themes/impl/StarfinderRoll20.js',
                    'src/themes/impl/StarfinderSimple.js',
              'src/themes/impl/DefaultTheme.js',
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
          bshields: false,
          CharSheetUtils: false,
          CheckItOut: true,
          HtmlBuilder: false,
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
          state: true
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
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-string-replace');

  grunt.registerTask('default', ['jshint', 'concat',  'string-replace']);
};
