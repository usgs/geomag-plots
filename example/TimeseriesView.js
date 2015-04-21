'use strict';

var d3 = require('d3'),
    D3TimeseriesView = require('D3TimeseriesView'),
    TimeseriesResponse = require('TimeseriesResponse'),
    TimeseriesView = require('TimeseriesView'),
    Xhr = require('util/Xhr');

var el = document.querySelector('#example');

Xhr.ajax({
  url: 'observatory_data.json',
  success: function (data) {
    TimeseriesView({
      el: el,
      timeseries: TimeseriesResponse(data).getTimeseries()[0]
    });
  }
});
