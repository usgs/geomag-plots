'use strict';


var d3 = require('d3'),
    D3GraphView = require('D3GraphView');


/**
 * Display a Timeseries model.
 *
 * @param options {Object}
 *        all options are passed to D3GraphView.
 * @param options.data {Timeseries}
 *        data to plot.
 */
var D3TimeseriesView = function (options) {
  var _this,
      _initialize,
      // variables
      _data,
      _el,
      _line,
      _point,
      _timeseries,
      _x,
      _y,
      // methods
      _bisectDate,
      _defined,
      _getX,
      _getY,
      _onMouseMove,
      _onMouseOut;

  _this = D3GraphView(options);

  _initialize = function () {
    // data line
    _timeseries = null;
    // used to plot _timeseries
    _line = d3.svg.line()
        .x(_getX)
        .y(_getY)
        .defined(_defined);
    // used to find closest date based on current mouse position
    _bisectDate = d3.bisector(function (d) {
      return d;
    }).left;
    // mouse tracking event handlers
    _el = d3.select(_this.el.querySelector('.inner-frame'));
    _el.on('mousemove', _onMouseMove);
    _el.on('mouseout', _onMouseOut);
  };

  /**
   * Check whether value is defined at the given point.
   *
   * @param d {Number}
   *        index of point.
   * @return {Boolean}
   *         true if value is not null, false otherwise.
   */
  _defined = function (d) {
    return _data.values[d] !== null;
  };

  /**
   * Get the x coordinate of a data point.
   *
   * @param d {Number}
   *        index of point.
   * @return {Number}
   *         pixel x value.
   */
  _getX = function (d) {
    return _x(_data.times[d]);
  };

  /**
   * Get the y coordinate of a data point.
   *
   * @param d {Number}
   *        index of point.
   * @return {Number}
   *         pixel y value.
   */
  _getY = function (d) {
    return _y(_data.values[d]);
  };

  /**
   * Mouse move event handler.
   */
  _onMouseMove = function () {
    var coords,
        i,
        x,
        y;

    // determine mouse coordinates in svg coordinates.
    coords = d3.mouse(this);
    // find date closest to mouse position
    i = _bisectDate(_data.times, _x.invert(coords[0]), 1);
    // data point closest to x mouse position
    x = _data.times[i];
    y = _data.values[i];

    if (!x || !y) {
      // gap or out of plot, hide tooltip
      _onMouseOut();
      return;
    }

    // show data point on line
    _point.attr('class', 'point visible')
        .attr('transform',
            'translate(' + _getX(i) + ',' + _getY(i) + ')');
    // show tooltip of current point
    _this.showTooltip([x, y],
      [
        {
          class: 'value',
          text: y
        },
        {
          class: 'time',
          text: x.toISOString()
              .replace('T', ' ')
              .replace('.000Z' ,' UTC')
        }
      ]
    );
  };

  /**
   * Mouse out event handler.
   */
  _onMouseOut = function () {
    // hide point
    _point.attr('class', 'point');
    // hide tooltip
    _this.showTooltip(null);
  };

  /**
   * Get x axis extent.
   */
  _this.getXExtent = function () {
    var xExtent = _this.model.get('xExtent');
    if (xExtent === null) {
      _data = _this.model.get('data').get();
      xExtent = d3.extent(_data.times);
    }
    return xExtent;
  };

  /**
   * Get y axis extent.
   */
  _this.getYExtent = function () {
    var yExtent = _this.model.get('yExtent');
    if (yExtent === null) {
      _data = _this.model.get('data').get();
      yExtent = d3.extent(_data.values);
    }
    return yExtent;
  };

  /**
   * Update the timeseries that is displayed.
   *
   * @param el {SVGElement}
   *        element where data should be plotted.
   */
  _this.plot = function (el) {
    if (_timeseries === null) {
      // first plot, create elements
      el = d3.select(el);
      _timeseries = el.append('path')
          .attr('class', 'timeseries');
      _point = el.append('circle')
          .attr('r', 2)
          .attr('class', 'point');
    }
    // update references used by _line function callbacks
    _data = _this.model.get('data').get();
    _x = _this.model.get('xAxisScale');
    _y = _this.model.get('yAxisScale');
    // plot timeseries
    _timeseries.attr('d', _line(d3.range(_data.times.length)));
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = D3TimeseriesView;
