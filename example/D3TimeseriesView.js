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
      var meta = timeseries.get('metadata');
      D3TimeseriesView({
        el: el.appendChild(document.createElement('div')),
        data: timeseries,
        height: 300,
        width: 960,
        xAxisLabel: 'Time (UTC)',
        xAxisScale: d3.time.scale.utc(),
        yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)',
        yAxisScale: d3.scale.linear()
      }).render();
    });
  }
});
