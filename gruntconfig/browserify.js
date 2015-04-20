'use strict';

var config = require('./config');

var CWD = process.cwd(),
    EXPORTS = [],
    NODE_MODULES = CWD + '/node_modules';


/**
 * Utility function for managing EXPORTS array.
 *
 * @param basedir {String}
 *        export base directory, relative to project root.
 * @param files {Array<String>}
 *        array of files to add to export.
 */
var addExports = function (basedir, files) {
  files.forEach(function (f) {
    EXPORTS.push(CWD + '/' + basedir + '/' + f + '.js:' + f);
  });
};

// List individual modules here. Each listed module will be aliased in the
// "bundle", and will be set as an external in "test"s and "example"s.

EXPORTS.push(NODE_MODULES + '/d3/d3.js:d3');

// hazdev-webutils exports
addExports('node_modules/hazdev-webutils/src', [
  'mvc/Collection',
  'mvc/Model',
  'mvc/View',
  'util/Util',
  'util/Xhr'
]);

// project exports
addExports(config.src + '/htdocs/js', [
  'D3GraphView',
  'D3TimeseriesView'
]);

// Subsequent source files can then require "Class" with:
// var Class = require('package/Class');


var browerify = {
  options: {
    browserifyOptions: {
      debug: true,
      paths: [
        CWD + '/' + config.src + '/htdocs/js',
        NODE_MODULES + '/d3',
        NODE_MODULES + '/hazdev-webutils/src'
      ]
    }
  },


  // the bundle used by the index page
  index: {
    src: [config.src + '/htdocs/js/index.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/index.js'
  },

  // the bundle used by tests
  bundle: {
    src: [],
    dest: config.build + '/' + config.src + '/htdocs/js/bundle.js',
    options: {
      alias: EXPORTS
    }
  },

  // the bundle of test suites
  test: {
    src: [config.test + '/test.js'],
    dest: config.build + '/' + config.test + '/test.js'
  }
};

module.exports = browerify;
