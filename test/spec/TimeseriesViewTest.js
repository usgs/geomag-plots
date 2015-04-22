/* global before, chai, describe, it */
'use strict';

var expect = chai.expect,
    TimeseriesResponse = require('TimeseriesResponse'),
    TimeseriesView = require('TimeseriesView'),
    Xhr = require('util/Xhr');

describe('TimeseriesView Test', function () {

  describe('constructor', function () {
    it('is defined', function () {
      expect(TimeseriesView).to.not.equal(null);
    });
  });

  describe('destroy', function () {
    var response;

    before(function (done) {
      Xhr.ajax({
        url: 'observatory_data.json',
        success: function (data) {
          response = TimeseriesResponse(data);
          done();
        }
      });
    });

    it('can be destroyed', function () {
      var newTimeseriesView = TimeseriesView({
        el: document.createElement('div'),
        timeseries: response.getTimeseries()[0]
      });
      expect(newTimeseriesView).to.not.equal(undefined);
      expect(newTimeseriesView.el).to.not.equal(null);

      newTimeseriesView.destroy();
      expect(newTimeseriesView.el).to.equal(null);
    });
  });

});
