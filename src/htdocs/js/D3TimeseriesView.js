'use strict';


var d3 = require('d3'),
    D3GraphView = require('D3GraphView'),
    Util = require('util/Util');


// used to find closest date based on current mouse position
var __bisectDate = d3.bisector(function (d) {
  return d;
}).left;


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
    var el = d3.select(_this.dataEl);
    // data line
    _timeseries = el.append('path')
        .attr('class', 'timeseries')
        .attr('clip-path', 'url(#plotAreaClip)');
    // hovered data point
    _point = el.append('circle')
        .attr('class', 'point');
    // used to plot _timeseries
    _line = d3.svg.line()
        .x(_getX)
        .y(_getY)
        .defined(_defined);
    // mouse tracking event handlers
    _el = d3.select(_this.el.querySelector('.inner-frame'));
    _el.on('mousemove', _onMouseMove);
    _el.on('mouseout', _onMouseOut);
  };

  _this.destroy = Util.compose(function () {
    // unbind listeners
    _el.on('mousemove', null);
    _el.on('mouseout', null);
    // free references
    _el = null;
    _timeseries = null;
    _point = null;
    _line = null;
    _bisectDate = null;
    _data = null;
    _x = null;
    _y = null;
    _defined = null;
    _getX = null;
    _getY = null;
    _onMouseMove = null;
    _onMouseOut = null;
    _this = null;
  }, _this.destroy);

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
    i = __bisectDate(_data.times, _x.invert(coords[0]), 1);
    // data point closest to x mouse position
    x = _data.times[i];
    y = _data.values[i];

    if (!x || !y) {
      // gap or out of plot, hide tooltip
      _onMouseOut();
      return;
    }

    // show data point on line
    _point.attr('transform', 'translate(' + _getX(i) + ',' + _getY(i) + ')')
        .classed({'visible': true});
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
    _point.classed({'visible': false});
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
   * @param changed {Object}
   *        options that changed.
   *        when undefined, render everything.
   */
  _this.plot = function (changed) {
    var options;

    changed = changed || _this.model.get();
    options = _this.model.get();

    if (changed.hasOwnProperty('pointRadius')) {
      // update point radius
      _point.attr('r', options.pointRadius);
    }

    // update references used by _line function callbacks
    _data = options.data.get();
    _x = options.xAxisScale;
    _y = options.yAxisScale;
    // plot timeseries
    _timeseries.attr('d', _line(d3.range(_data.times.length)));
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = D3TimeseriesView;
