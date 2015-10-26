'use strict';

var config = require('./config');


var watch = {
  resources: {
    files: [
      config.src + '/**/*',
      '!' + config.src + '/**/*.scss',
      '!' + config.src + '/**/*.js'
    ],
    tasks: [
      'copy:dev'
    ]
  },

  scss: {
    files: [
      config.src + '/**/*.scss'
    ],
    tasks: [
      'postcss:build'
    ]
  },

  scripts: {
    files: [
      config.src + '/htdocs/**/*.js'
    ],
    tasks: [
      'jshint:dev',
      'browserify:index',
      'browserify:bundle'
    ]
  },

  tests: {
    files: [
      config.test + '/**/*.js'
    ],
    tasks: [
      'jshint:test',
      'browserify:test'
    ]
  },

  gruntfile: {
    files: [
      'Gruntfile.js',
      'gruntconfig/**/*.js'
    ],
    tasks: [
      'jshint:gruntfile'
    ]
  },

  livereload: {
    options: {
      livereload: config.liveReloadPort
    },
    files: [
      config.build + '/' + config.src + '/**/*'
    ]
  }
};


module.exports = watch;
