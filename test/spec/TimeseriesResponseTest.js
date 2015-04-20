/* global before, chai, describe, it */
'use strict';

var expect = chai.expect,
    TimeseriesResponse = require('TimeseriesResponse'),
    Xhr = require('util/Xhr');


describe('TimeseriesResponse Test', function () {

  describe('constructor', function () {
    it('is defined', function () {
      expect(TimeseriesResponse).to.not.equal(null);
    });
  });

  describe('getTimeseries', function () {
    var response;

    before(
      function (done) {
        Xhr.ajax({
          url: 'observatory_data.json',
          success: function (data) {
            response = TimeseriesResponse(data);
            done();
          }
        });
      }
    );

    it('Return correct number of Timeseries objects', function () {
      expect(response.getTimeseries().length).to.equal(14);
    });

    it('Converts times to date objects', function () {
      expect(response.getTimeseries()[0].get('times')[0]).to.be.an.instanceof(Date);
    });
  });

});
