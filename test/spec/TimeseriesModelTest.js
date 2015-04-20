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
});
