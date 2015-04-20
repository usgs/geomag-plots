'use strict';


var d3 = require('d3'),
    D3TimeseriesView = require('D3TimeseriesView'),
    Xhr = require('util/Xhr');

var el = document.querySelector('#example');


Xhr.ajax({
  url: 'observatory_data.json',
  success: function (data) {
    var times;

    times = data.times.map(function (t) {
      return new Date(t*1000);
    });

    data.data.forEach(function (obs) {
      var title,
          value,
          view;
      for (value in obs.values) {
        D3TimeseriesView({
          el: el.appendChild(document.createElement('div')),
          data: {
            x: times,
            y: obs.values[value]
          },
          height: 300,
          width: 960,
          xAxisLabel: 'Time (UTC)',
          xAxisScale: d3.time.scale.utc(),
          yAxisLabel: obs.id + ' ' + value + ' (nT)',
          yAxisScale: d3.scale.linear()
        }).render();
      }
    });
  }
});
