/* global chai, describe, it */
'use strict';

var expect = chai.expect,
    TimeseriesFactory = require(TimeseriesFactory);


describe('TimeseriesFactory', function () {

  describe('Construtor', function () {
    it('can run tests', function () {
      timeseriesFactory = TimeseriesFactory({url:'data.json'});
      expect(timeseriesFactory.url).to.equal('data.json');
    });
  });

});
