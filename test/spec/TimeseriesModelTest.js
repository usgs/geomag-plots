/* global chai, describe, it */
'use strict';

var expect = chai.expect,
    TimeseriesModel = require('TimeseriesModel'),
    Xhr = require('util/Xhr');

describe('TimeseriesModel Test', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(TimeseriesModel).to.not.equal(null);
    });
  });

  describe('Test getGaps', function () {
    var response;

    before(function (done) {
      Xhr.ajax({
        url: 'observatory_data.json',
        success: function (data) {
          response = TimeseriesResponse(data);
          done();
        }
      });
    }

    it('returns gaps in data', function () {
      expect(response.getGaps().to.equal(50));
    });
  });
});
