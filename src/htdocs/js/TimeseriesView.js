'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),

    D3TimeseriesView = require('D3TimeseriesView');


/**
 * Display a Timeseries Response model.
 *
 * @param options {Object}
 *        all options are passed to View.
 */
var TimeseriesView = function (options) {
  var _this,
      _initialize,

      _height,
      _timeseries,
      _trace,
      _width,
      _yExtent,

      _yAxisFormat,
      _yAxisTicks;


  _this = View(options);

  _initialize = function (options) {
    _height = options.height || 240;
    _timeseries = options.timeseries;
    _width = options.width || 960;   // 480 looks better for mobile

    _this.el.classList.add('timeseries-view');

    _this.render();
  };

  /**
   * Format ticks shown on y axis.
   *
   * @param y {Number}
   *        value where tick is shown.
   * @return {String}
   *         formatted tick.
   *         this function displays actual value at min/max,
   *         or the size of the value range at the average.
   * @see yAxisTicks
   */
  _yAxisFormat = function (y) {
    var range;
    if (y === _yExtent[0] || y === _yExtent[1]) {
      // display min/max
      return y;
    } else {
      // display range in middle
      range = _yExtent[1] - _yExtent[0];
      return '(' + range.toFixed(1) + ' nT)';
    }
  };

  /**
   * Generate ticks to show on y axis.
   *
   * @param extent {Array<Number>}
   *        array containing current y extent [min, max].
   * @return {Array<Number>}
   *         values where ticks should be displayed.
   *         this function generates ticks at min, average, and max.
   * @see yAxisFormat
   */
  _yAxisTicks = function (extent) {
    var average;
    // save extent for calls to yAxisFormat
    _yExtent = extent;
    // create tick at min/max and average
    average = (_yExtent[0] + _yExtent[1]) / 2;
    return [_yExtent[1], average, _yExtent[0]];
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _this = null;
    _trace.destroy();
  }, _this.destroy);

  _this.render = function () {
    var meta = _timeseries.get('metadata'),
        metaView,
        traceView;

    metaView = document.createElement('div');
    metaView.className = 'meta-view';

    metaView.innerHTML = meta.observatory + ' ' + meta.channel + ' (nT)';
    _this.el.appendChild(metaView);

    traceView = document.createElement('div');
    traceView.className = 'trace-view';

    _trace = D3TimeseriesView({
      el: _this.el.appendChild(traceView),
      data: _timeseries,
      // title: meta.observatory,
      height: _height,
      width: _width,
      xAxisLabel: 'Time (UTC)',
      yAxisFormat: _yAxisFormat,
      // yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)'
      yAxisTicks: _yAxisTicks
    }).render();
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
