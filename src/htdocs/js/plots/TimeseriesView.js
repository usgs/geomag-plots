'use strict';

var Model = require('mvc/Model'),
    Util = require('util/Util'),
    View = require('mvc/View'),

    D3TimeseriesView = require('plots/D3TimeseriesView');


/**
 * Display a Timeseries Response model.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.el {DOMElement}
 *        parent element to attach the TimeseriesView elements to.
 * @param options.height {Integer}
 *        optional, initial height of the plotted data trace.
 * @param options.timeseries {Array<Timeseries>}
 *        timeseries to display.
 * @param options.width {Integer}
 *        optional, initial width of the plotted data trace.
 */
var TimeseriesView = function (options) {
  var _this,
      _initialize,

      _errorLoading,
      _height,
      _metaViewEl,
      _onTimeseriesError,
      _timeseries,
      _trace,
      _traceViewEl,
      _width,
      _yExtent,

      _yAxisFormat,
      _yAxisTicks;

  _this = View(options);

  _initialize = function (options) {
    var el;

    _errorLoading = options.errorLoading || null;
    _height = options.height || 240;
    _timeseries = options.timeseries;
    _width = options.width || 960;   // 480 looks better for mobile
    _this.model = options.plotModel || Model();

    el = _this.el;
    el.classList.add('timeseries-view');

    el.innerHTML =
        '<div class="meta-view"></div>' +
        '<div class="trace-view"></div>';

    _metaViewEl = el.querySelector('.meta-view');
    _traceViewEl = el.querySelector('.trace-view');

    _trace = D3TimeseriesView({
      plotModel: _this.model,
      el: _traceViewEl,
      data: _timeseries,
      // title: meta.observatory,
      height: _height,
      width: _width,
      paddingBottom: 25,
      paddingLeft: 90,
      paddingRight: 1,
      paddingTop: 1,
      xAxisLabel: '',
      yAxisFormat: _yAxisFormat,
      yAxisTicks: _yAxisTicks,
      yAxisTooltip: _this.formatTooltipValue
    });

    _timeseries.on('change', _this.render);
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
    var element,
        range,
        units;

    element = _timeseries.get('element') || {};
    if (element.properties) {
      units = element.properties.units;
    } else {
      units = 'nT';
    }

    if (y === _yExtent[0] || y === _yExtent[1]) {
      // display min/max
      return y.toFixed(1) + ' ' + units;
    } else {
      // display range in middle
      range = _yExtent[1] - _yExtent[0];
      return '(' + range.toFixed(1) + ' ' + units + ')';
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
    _timeseries.off('change', _this.render);
    _trace.destroy();

    _errorLoading = null;
    _height = null;
    _metaViewEl = null;
    _onTimeseriesError = null;
    _timeseries = null;
    _trace = null;
    _traceViewEl = null;
    _width = null;
    _yExtent = null;
    _yAxisFormat = null;
    _yAxisTicks = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _this.formatTooltipValue = function (value) {
    var element,
        units;

    element = _timeseries.get('element') || {};
    units = element.properties ? element.properties.units : 'nT';

    return value + ' ' + units;
  };

  _this.render = function () {
    var element,
        elementDisplay,
        observatory;

    element = _timeseries.get('element') || {};
    observatory = _timeseries.get('observatory') || {};

    elementDisplay = (element.properties && element.properties.abbreviation) ?
      element.properties.abbreviation :
      element.id;

    _metaViewEl.innerHTML =
        '<span class="observatory">' + observatory.id + '</span>' +
        '<span class="channel">' + elementDisplay + '</span>';

    // render D3TimeseriesView, or xhr request error
    if (_errorLoading) {
      _onTimeseriesError();
    } else {
      _trace.render();
    }
  };


  /**
   * Errback for TimeseriesFactory.
   */
  _onTimeseriesError = function () {
    var config;

    config = _this.model.get();
    if (config) {
      _traceViewEl.innerHTML =
        '<div class="alert error">' +
          '<p>Failed to load timeseries data.</p>' +
        '</div>';
    }
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
