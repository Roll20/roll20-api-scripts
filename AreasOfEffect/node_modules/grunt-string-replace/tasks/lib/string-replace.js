/*
 * grunt-string-replace
 * https://github.com/eruizdechavez/grunt-string-replace
 *
 * Copyright (c) 2016 Erick Ruiz de Chavez
 * Licensed under the MIT license.
 */
var util = require('util'),
  async = require('async'),
  chalk = require('chalk'),
  counter = 0;

exports.init = function(grunt) {
  'use strict';

  var path = require('path');

  var detectDestType = function(dest) {
    if (dest[dest.length - 1] === '/') {
      return 'directory';
    } else {
      return 'file';
    }
  };

  var unixifyPath = function(filepath) {
    var path = '';
    if (process.platform === 'win32') {
      path = filepath.replace(/\\/g, '/');
    } else {
      path = filepath;
    }
    return path;
  };

  exports.replace = function(files, replacements, options, replace_done) {
    var content, newContent, dest;

    if (!replace_done) {
      replace_done = options;
      options = {};
    }

    if (!options.hasOwnProperty("saveUnchanged")) {
      options.saveUnchanged = true;
    } else {
      options.saveUnchanged = !!options.saveUnchanged;
    }

    async.forEach(files, function(file, files_done) {
      async.forEach(file.src, function(src, src_done) {
        grunt.log.debug('working on file', src);

        if (!grunt.file.exists(src)) {
          grunt.log.debug('file not fount', src);
          return src_done(src + ' file not found');
        }

        if (grunt.file.isDir(src)) {
          grunt.log.debug('source file is a directory', src);
          return src_done();
        }

        if (detectDestType(file.dest) === 'directory') {
          grunt.log.debug('destination is a directory');

          if (grunt.file.doesPathContain(file.dest, src)) {
            dest = path.join(file.dest, src.replace(file.dest, ''));
          } else {
            dest = path.join(file.dest, src);
          }
        } else {
          dest = file.dest;
        }

        dest = unixifyPath(dest);
        grunt.log.debug('unixified path is', dest);
        content = grunt.file.read(src);
        newContent = exports.multi_str_replace(content, replacements, src, dest);

        if (content !== newContent || options.saveUnchanged) {
          grunt.file.write(dest, newContent);
          counter+=1;
          grunt.verbose.writeln('File ' + chalk.cyan(dest) + ' created.');
        } else {
          grunt.log.writeln('File ' + chalk.cyan(dest) + ' ' + chalk.red('not') + ' created; No replacements found.');
        }

        return src_done();

      }, files_done);
    }, function(err) {
      if (err) {
        grunt.log.error(err);
        replace_done(false);
      }
        grunt.log.writeln('\n'+ chalk.cyan(counter) + ' files created');
      replace_done();
    });
  };

  exports.normalize_replacements = function(replacements) {
    return replacements.map(function(replacement) {
      return [replacement.pattern, replacement.replacement];
    });
  };

  var decorate_replace_function = function(replacement, src, dest) {
    grunt.log.debug('decorating replace function with extra arguments');

    return function () {
      grunt.log.debug('running decorated replace function with extra arguments');
      var args = Array.prototype.slice.apply(arguments);
      args.push(src, dest);
      return replacement.apply(null, args);
    };
  };

  exports.multi_str_replace = function(string, replacements, src, dest) {
    return replacements.reduce(function(content, replacements) {
      var pattern = replacements[0];
      var replacement = replacements[1];

      if (typeof replacement === 'function') {
        grunt.log.debug('replacing function with augmented one');
        replacement = decorate_replace_function(replacement, src, dest);
      }

      return content.replace(pattern, replacement);
    }, string);
  };

  return exports;
};
