'use strict';

var TimeseriesFactory = require('TimeseriesFactory'),
    Xhr = require('util/Xhr'),
    url = 'http://geomag.usgs.gov/map/observatories_data.json.php',
    timeseriesFactory = TimeseriesFactory({url:url});

timeseriesFactory.getTimeseries({
  observatory:'BOU',
  channel: null,
  starttime: new Date(1429459810000),
  endtime: new Date(1429546200000),
  callback: function (response) {
    var el = document.getElementById('example'),
        data = response.getTimeseries();

    el.innerHTML = data[0].get('metadata').observatory;
    console.log(data[0].get('values'));
   }
});

