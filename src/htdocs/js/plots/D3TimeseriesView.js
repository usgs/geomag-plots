'use strict';


var d3 = require('d3'),
    D3GraphView = require('plots/D3GraphView'),
    Util = require('util/Util');


var __dateFormat = d3.time.format.utc.multi([
  [':%S', function(d) { return d.getUTCSeconds(); }],
  ['%H:%M', function(d) { return d.getUTCMinutes(); }],
  ['%H:00', function(d) { return d.getUTCHours(); }],
  ['%a %e', function(d) { return d.getUTCDay() && d.getUTCDate() !== 1; }],
  ['%b %e', function(d) { return d.getUTCDate() !== 1; }],
  ['%b', function(d) { return d.getUTCMonth(); }],
  ['%Y', function() { return true; }]
]);

/**
 * Format a date for display in tooltip.
 *
 * @param d {Date}
 *        date to format.
 * @return {String}
 *         formatted date.
 */
var __formatTooltipDate = function (d) {
  d = d.toISOString();
  d = d.replace(/^.*T/, '');
  d = d.replace('.000Z' ,'');
  return d;
};

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
      _gaps,
      _gapsEl,
      _line,
      _point,
      _timeseries,
      _x,
      _y,
      // methods
      _defined,
      _gapStart,
      _getX,
      _getY,
      _onGapOver,
      _onMouseMove,
      _onMouseOut;

  _this = D3GraphView(Util.extend({
    height: 300,
    width: 960,
    xAxisFormat: __dateFormat,
    xAxisScale: d3.time.scale.utc()
  }, options));

  _initialize = function () {
    var el = d3.select(_this.dataEl);
    // data gaps
    _gapsEl = el.append('g')
        .attr('class', 'gaps')
        .attr('clip-path', 'url(#plotAreaClip)');
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

    _this.plotModel.on('change:tooltipX', 'renderTooltip', _this);
  };

  _this.destroy = Util.compose(function () {
    _this.plotModel.off('change:tooltipX', 'renderTooltip', _this);

    // unbind listeners
    _el.on('mousemove', null);
    _el.on('mouseout', null);
    // free references
    _data = null;
    _el = null;
    _gaps = null;
    _gapsEl = null;
    _line = null;
    _point = null;
    _timeseries = null;
    _x = null;
    _y = null;
    _defined = null;
    _gapStart = null;
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
   * Get the start of a gap object.
   *
   * @param g {Object}
   *        gap object.
   * @return {Date}
   *         start of gap.
   */
  _gapStart = function (g) {
    return g.start;
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
   * Gap mouse over event handler.
   *
   * @param gap {Object}
   *        gap.start {Date} start of gap
   *        gap.end {Date} end of gap.
   * @param x {Date}
   *        date closest to current mouse position.
   */
  _onGapOver = function (gap, x) {
    var centerY,
        yExtent;
    yExtent = _y.domain();
    centerY = (yExtent[0] + yExtent[1]) / 2;

    // show data point on line
    _point.classed({'visible': true})
        .attr('transform',
            'translate(' + _x(x) + ',' + _y(centerY) + ')');
    _this.showTooltip([x, centerY],
      [
        {
          class: 'value',
          text: 'NO DATA'
        },
        {
          class: 'time',
          text: __formatTooltipDate(gap.start) +
              ' - ' + __formatTooltipDate(gap.end)
        }
      ]
    );
  };

  /**
   * Mouse move event handler.
   */
  _onMouseMove = function () {
    var coords,
        i,
        i0,
        t,
        t0,
        x;

    // determine mouse coordinates in svg coordinates.
    coords = d3.mouse(this);
    x = _x.invert(coords[0]);
    if (!x) {
      _onMouseOut();
      return;
    }

    // find date closest to mouse position
    i = d3.bisectLeft(_data.times, x, 1);
    // data point closest to x mouse position
    i0 = Math.max(0, i - 1);
    t = _data.times[i].getTime();
    t0 = _data.times[i0].getTime();
    x = x.getTime();

    if (x - t0 < t - x) {
      i = i0;
    }

    // set model property and let that render tooltip
    _this.plotModel.set({tooltipX: _data.times[i]});
  };

  /**
   * Mouse out event handler.
   */
  _onMouseOut = function () {
    _this.plotModel.set({'tooltipX': null});
  };

  _this.renderTooltip = function () {
    var i,
        tooltipX,
        x,
        xpos,
        y;

    tooltipX = _this.plotModel.get('tooltipX');

    if (tooltipX === null) {
      // hide point
      _point.classed({'visible': false});
      // hide tooltip
      _this.showTooltip(null);
    } else {
      i = d3.bisectLeft(_data.times, tooltipX, 1);
      x = _data.times[i];
      y = _data.values[i];

      if (!y) {
        // gap or out of plot
        i = d3.bisector(_gapStart).left(_gaps, x) - 1;
        if (i >= 0) {
          // found gap
          _onGapOver(_gaps[i], x);
        } else {
          _onMouseOut();
        }
        return;
      }

      xpos = _x(x);

      // show data point on line (if in plot extent)
      _point.attr('transform', 'translate(' + xpos + ',' + _y(y) + ')')
          .classed({'visible': (xpos>0)});

      // show tooltip of current point
      _this.showTooltip([x, y],
        [
          {
            class: 'value',
            text: y
          },
          {
            class: 'time',
            text: __formatTooltipDate(x)
          }
        ]
      );
    }
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
   *
   * @param xExtent {Array<Number>}
   *        current x extent.
   * @return {Array<Number>}
   *         y extent.
   */
  _this.getYExtent = function (xExtent) {
    var dataValues,
        yExtent = _this.model.get('yExtent'),
        yExtentSize,
        yMean,
        minXIndex,
        maxXIndex;

    if (yExtent === null) {
      _data = _this.model.get('data').get();
      dataValues = _data.values;

      if (xExtent) {
        minXIndex = d3.bisectLeft(_data.times, xExtent[0]);
        maxXIndex = d3.bisectLeft(_data.times, xExtent[1]);
        dataValues = _data.values.slice(
            // include points just outside range
            Math.max(0, minXIndex - 1),
            Math.min(_data.values.length, maxXIndex + 2)
        );
      }

      yExtentSize = _this.plotModel.get('yExtentSize');

      if (!yExtentSize) {
        yExtent = d3.extent(dataValues);
        if (isNaN(yExtent[0]) || isNaN(yExtent[1])) {
          // if undefined over current x range, try entire range
          yExtent = d3.extent(_data.values);
        }
        if (isNaN(yExtent[0]) || isNaN(yExtent[1])) {
          // if still undefined use arbitrary scale
          return [0, 1];
        }
      } else {
        yMean = d3.mean(dataValues) || 0;
        yExtent = [(yMean - yExtentSize / 2), (yMean + yExtentSize / 2)];
      }

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
    var gaps,
        gapCache,
        options,
        yExtent;

    changed = changed || _this.model.get();
    options = _this.model.get();

    if (changed.hasOwnProperty('pointRadius')) {
      // update point radius
      _point.attr('r', options.pointRadius);
    }

    // update references used by _line function callbacks
    _data = options.data.get();
    _gaps = options.data.getGaps();
    _x = options.xAxisScale;
    _y = options.yAxisScale;

    // compute gap extents once
    // eliminates repeated calculations for left/top
    yExtent = _y.domain();
    gapCache = {};
    gapCache.top = _y(yExtent[1]);
    gapCache.bottom = _y(yExtent[0]);
    gapCache.height = gapCache.bottom - gapCache.top;
    _gaps.forEach(function (gap) {
      var g = {},
          xMin,
          xMax;
      xMin = Math.max(0, gap.startIndex - 1);
      xMax = Math.min(_data.values.length - 1, gap.endIndex + 1);
      g.left = _getX(xMin);
      g.right = _getX(xMax);
      g.width = g.right - g.left;
      gapCache[gap.startIndex] = g;
    });

    // plot gaps
    gaps = _gapsEl.selectAll('rect').data(_gaps);
    gaps.enter()
        .append('rect')
        .attr('class', 'gap');
    gaps.attr('x', function (g) { return gapCache[g.startIndex].left; })
        .attr('width', function (g) { return gapCache[g.startIndex].width; })
        .attr('y', function () { return gapCache.top; })
        .attr('height', function () { return gapCache.height; });
    gaps.exit()
        .remove();

    // plot timeseries
    _timeseries.attr('d', _line(d3.range(_data.times.length)));

    _this.renderTooltip();
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = D3TimeseriesView;
