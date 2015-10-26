'use strict';

var concurrent = {
  dev: [
    'browserify:index',
    'browserify:bundle',
    'copy:dev',
    'postcss:build'
  ],

  dist: [
    'copy:dist',
    'uglify',
    'postcss:dist'
  ],

  test: [
    'browserify:test',
    'copy:test'
  ]
};

module.exports = concurrent;
