'use strict';


var d3 = require('d3'),
    TimeseriesCollectionView = require('TimeseriesCollectionView'),
    TimeseriesResponse = require('TimeseriesResponse'),
    Xhr = require('util/Xhr');

var el = document.querySelector('#example');


Xhr.ajax({
  url: 'observatory_data.json',
  success: function (data) {
    var collection = TimeseriesResponse(data);
    TimeseriesCollectionView({el:el, collection:collection});
  }
});
