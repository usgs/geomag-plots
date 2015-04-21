'use strict';


var Collection = require('mvc/Collection'),
    Xhr = require('util/Xhr'),

    TimeseriesApp = require('TimeseriesApp'),
    TimeseriesResponse = require('TimeseriesResponse');


var app,
    configEl,
    el,
    timeseries;

configEl = document.querySelector('#site-sectionnav');
el = document.querySelector('#geomag-plots');
timeseries = Collection();

app = TimeseriesApp({
  configEl: configEl,
  el: el,
  timeseries: timeseries
});


// TODO: use configuration to load data
var getSeconds = function (age) {
  return Math.round(new Date(new Date().getTime() - age).getTime() / 1000);
};

Xhr.ajax({
  url: 'http://geomag.usgs.gov/map/observatories_data.json.php',
  data: {
    endtime: getSeconds(0),
    starttime: getSeconds(86400000),
    'chan[]': 'H',
    freq: 'minutes'
  },
  success: function (data) {
    timeseries.reset(TimeseriesResponse(data).getTimeseries());
  }
});
