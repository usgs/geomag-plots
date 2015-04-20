'use strict';

var TimeseriesResponse = require('TimeseriesResponse'),
    View = require('mvc/View');


/**
 * Display a Timeseries Response model.
 *
 * @param options {Object}
 *        all options are passed to View.
 */
var TimeseriesView = function (options) {
  var _this,
      _initialize,

      _el;

  _this = View(options);

  _initialize = function () {
    _el = options._el;

  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
