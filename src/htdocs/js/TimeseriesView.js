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

      _el,
      _meta,
      _trace;

  _this = View(options);

  _initialize = function (options) {
    _el = options._el;

    var series = TimeseriesResponse();
    console.log(series);

    _el.innerHTML = [
      '<div class="meta-data"></div>',
      '<div class="trace-data"></div>'
    ].join('');

    _meta = _el.querySelector('meta-data');
    _trace = _el.querySelector('trace-data');

    _meta.innerHTML = 'Meta';
    _trace.innerHTML = 'Trace';
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
