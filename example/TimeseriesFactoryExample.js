'use strict';

var TimeseriesFactory = require('plots/TimeseriesFactory'),
    Xhr = require('util/Xhr'),
    url = 'observatory_data.json',
    timeseriesFactory = TimeseriesFactory({url:url});

timeseriesFactory.getTimeseries({
  observatory:'BOU',
  element: null,
  starttime: new Date(1429459810000),
  endtime: new Date(1429546200000),
  callback: function (response) {
    var el = document.getElementById('example'),
        data = response.getTimeseries();

    el.innerHTML = data[3].get('metadata').observatory;
    console.log(data[3].get('values'));
   }
});
