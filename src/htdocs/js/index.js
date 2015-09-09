/* global _CONFIG */
'use strict';


var TimeseriesApp = require('TimeseriesApp');


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

configEl = document.querySelector('#site-sectionnav');
el = document.querySelector('#geomag-plots');

app = TimeseriesApp({
  channels: [
    'H',
    'E',
    'Z',
    'F',
    'Dist',
    'DeltaF'
  ],
  config: {
    channel: 'H',
    endtime: __getTime(0),
    timemode: 'pastday',
    starttime: __getTime(86400000 * 3)
  },
  configEl: configEl,
  el: el,

  obsMetaUrl: _CONFIG.obsMetaUrl,
  obsDataUrl: _CONFIG.obsDataUrl
});
