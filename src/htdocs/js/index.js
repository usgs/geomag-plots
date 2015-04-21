'use strict';


var TimeseriesApp = require('TimeseriesApp');


var app,
    configEl,
    el;

configEl = document.querySelector('#site-sectionnav');
el = document.querySelector('#geomag-plots');

app = TimeseriesApp({
  configEl: configEl,
  el: el
});
