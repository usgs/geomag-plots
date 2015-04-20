'use strict';


var TimeseriesView = require('TimeseriesView'),
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
      var value;

      for (value in obs.values) {
        TimeseriesView({
          el: el.appendChild(document.createElement('div'))
        }).render();
      }
    });
  }
});
