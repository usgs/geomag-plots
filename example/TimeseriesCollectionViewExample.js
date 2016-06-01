'use strict';


var d3 = require('d3'),
    Collection = require('mvc/Collection'),
    TimeseriesCollectionView = require('plots/TimeseriesCollectionView'),
    TimeseriesResponse = require('plots/TimeseriesResponse'),
    Xhr = require('util/Xhr');

var el = document.querySelector('#example');


Xhr.ajax({
  url: 'observatory_data.json',
  success: function (data) {
    var collection = Collection(),
        timeseries;
    collection.reset(TimeseriesResponse(data).getTimeseries());

    TimeseriesCollectionView({el:el, collection:collection});
  }
});
