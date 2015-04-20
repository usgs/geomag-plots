'use strict';

var Model = require('mvc/Model');


var TimeseriesResponse = function (options) {
  var _this;

  _this = Model(options);

  _this.getTimeseries = function () {
    return [{}];
  };

  options = null;
  return _this;
};


module.exports = TimeseriesResponse;
