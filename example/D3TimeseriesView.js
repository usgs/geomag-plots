'use strict';


var d3 = require('d3'),
    D3TimeseriesView = require('D3TimeseriesView'),
    TimeseriesResponse = require('TimeseriesResponse'),
    Xhr = require('util/Xhr');

var el = document.querySelector('#example');


Xhr.ajax({
  url: 'observatory_data.json',
  success: function (data) {
    TimeseriesResponse(data).getTimeseries().forEach(function (timeseries) {
      var yAxisFormat,
          yAxisTicks,
          yExtent;

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
      yAxisTicks = function (extent) {
        var average;
        // save extent for calls to yAxisFormat
        yExtent = extent;
        // create tick at min/max and average
        average = (yExtent[0] + yExtent[1]) / 2;
        return [yExtent[1], average, yExtent[0]];
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
      yAxisFormat = function (y) {
        var range;
        if (y === yExtent[0] || y === yExtent[1]) {
          // display min/max
          return y;
        } else {
          // display range in middle
          range = yExtent[1] - yExtent[0];
          return '(' + range.toFixed(1) + ' nT)';
        }
      };


      D3TimeseriesView({
        el: el.appendChild(document.createElement('div')),
        data: timeseries,
        xAxisLabel: 'Time (UTC)',
        yAxisFormat: yAxisFormat,
        yAxisTicks: yAxisTicks
      }).render();
    });
  }
});
