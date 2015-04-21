'use strict';

var Model = require('mvc/Model'),
    Util = require('util/Util');


/**
 * Properties for one observatory
 *
 * @param options {options}
 *        all options are passed to Model.
 */
var Observatory = function (options) {
  var _this;

  _this = Model(Util.extend({
    id: null,
    name: null,
    latitude: null,
    longitude: null
  }, options));

  options = null;
  return _this;
};


module.exports = Observatory;
