'use strict';

var Model = require('mvc/Model'),
    Util = require('util/Util');

var Observatory = function (options) {
  var _this;

  _this = Model(Util.extend({

  }, options));
  
  options = null;
  return _this;

};

module.exports = Observatory;
