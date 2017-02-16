/* global _CONFIG */
'use strict';


var Timeseries = require('plots/Timeseries'),
    TimeseriesApp = require('plots/TimeseriesApp');


/**
 * Get a date based on age.
 *
 * @param age {Number}
 *        age in milliseconds, relative to 00:00 on current day.
 * @return {Date}
 *         Date object.
 */
var __getTime = function (age) {
  var now = new Date(),
      then;
  then = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ) - age);
  return then;
};


var app,
    configEl,
    el;

configEl = document.querySelector('#geomag-config');
el = document.querySelector('#geomag-plots');

app = TimeseriesApp({
  config: {
    endtime: __getTime(0),
    timemode: 'pastday',
    starttime: __getTime(86400000 * 3)
  },
  configEl: configEl,
  el: el,

  obsMetaUrl: _CONFIG.obsMetaUrl,
  obsDataUrl: _CONFIG.obsDataUrl
});

app.timeseriesManager.createTimeseries = function () {
  var elements,
      models,
      msd,
      observatories;

  elements = app.elements;
  observatories = app.observatories;

  // old Dist channel
  msd = {
    'type': 'Feature',
    'id': 'MSD',
    'properties': {
      'abbreviation': 'Dist',
      'name': 'Disturbance',
      'units': 'nT'
    },
    'geometry': null
  };


  // create models
  models = [
    Timeseries({
      id: 'dst3',
      element: {
        'type': 'Feature',
        'id': 'MSD',
        'properties': {
          'abbreviation': 'DST3',
          'name': '3 Station DST',
          'units': 'nT'
        },
        'geometry': null
      },
      observatory: observatories.get('USGS'),
      times: [],
      values: []
    }),
    Timeseries({
      id: 'dst4',
      element: {
        'type': 'Feature',
        'id': 'MGD',
        'properties': {
          'abbreviation': 'DST4',
          'name': '4 Station DST',
          'units': 'nT'
        },
        'geometry': null
      },
      observatory: observatories.get('USGS'),
      times: [],
      values: []
    }),
    Timeseries({
      id: 'dsth',
      element: {
        'type': 'Feature',
        'id': 'HGD',
        'properties': {
          'abbreviation': 'DSTH',
          'name': 'Hourly DST',
          'units': 'nT'
        },
        'geometry': null
      },
      observatory: observatories.get('USGS'),
      times: [],
      values: []
    }),
    Timeseries({
      id: 'hon_dist',
      element: msd,
      observatory: observatories.get('HON'),
      times: [],
      values: []
    }),
    Timeseries({
      id: 'sjg_dist',
      element: msd,
      observatory: observatories.get('SJG'),
      times: [],
      values: []
    }),
    Timeseries({
      id: 'her_dist',
      element: msd,
      observatory: observatories.get('HER'),
      times: [],
      values: []
    }),
    Timeseries({
      id: 'kak_dist',
      element: msd,
      observatory: observatories.get('KAK'),
      times: [],
      values: []
    })
  ];

  // reset timeseries collection
  app.timeseries.reset(models);
};