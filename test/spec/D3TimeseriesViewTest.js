/* global before, chai, describe, it */
'use strict';

var D3TimeseriesView = require('plots/D3TimeseriesView'),
    TimeseriesResponse = require('plots/TimeseriesResponse'),
    Xhr = require('util/Xhr');

var expect = chai.expect;

describe('D3TimeseriesView', function () {

  describe('constructor', function () {

    it('is defined', function () {
      expect(D3TimeseriesView).to.not.equal(null);
    });

    it('can be destroyed', function () {
      var view = D3TimeseriesView();
      view.destroy();
    });
  });

  describe('getYExtent', function () {
    var normalView,
        nullView;

    before(function (done) {
      Xhr.ajax({
        url: 'observatory_data.json',
        success: function (data) {
          var timeseries = TimeseriesResponse(data).getTimeseries();
          nullView = D3TimeseriesView({
            el: document.createElement('div'),
            data: timeseries[0]
          });
          normalView = D3TimeseriesView({
            el: document.createElement('div'),
            data: timeseries[3]
          });
          done();
        }
      });
    });

    it('can get the y-extents', function () {
      // null values return [0, 1] for y-extents
      expect(nullView.getYExtent()[0]).to.equal(0);
      expect(nullView.getYExtent()[1]).to.equal(1);
      // full extents of "z" values return [52329.116, 52363.78]
      expect(normalView.getYExtent()[0]).to.equal(52329.116);
      expect(normalView.getYExtent()[1]).to.equal(52363.78);
      // zoomed extents of "z" values returns [52334.6, 52334.747]
      expect(normalView.getYExtent([0,1])[0]).to.equal(52334.6);
      expect(normalView.getYExtent([0,1])[1]).to.equal(52334.747);
    });
  });

});
