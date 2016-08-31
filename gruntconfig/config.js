'use strict';


var extend = require('extend'),
    fs = require('fs'),
    ini = require('ini');


var config,
    basePort,
    iniConfig,
    packageJson;

basePort = 8880;
iniConfig = ini.parse(fs.readFileSync('./src/conf/config.ini', 'utf-8'));
iniConfig = extend({}, iniConfig, process.env);
packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));


config = {
  build: '.build',
  buildPort: basePort,
  dist: 'dist',
  distPort: basePort + 1,
  etc: 'etc',
  example: 'example',
  examplePort: basePort + 2,
  ini: iniConfig,
  lib: 'lib',
  packageJson: packageJson,
  src: 'src',
  templatePort: basePort + 3,
  test: 'test',
  testPort: basePort + 4,
  liveReloadPort: basePort + 9,

  cssPath: [
    'src/htdocs/css',
    'node_modules/hazdev-webutils/src'
  ],

  jsPath: {
    'src/htdocs/js': '*/*.js',
    'node_modules/d3': '*d3.js',
    'node_modules/hazdev-webutils/src': '**/*.js'
  }

};


module.exports = config;
