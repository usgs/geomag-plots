/* global chai, describe, it, sinon */
'use strict';

var expect = chai.expect,
    TimeseriesFactory = require('plots/TimeseriesFactory'),
    Xhr = require('util/Xhr');


describe('TimeseriesFactory', function () {
  describe('construtor', function () {
    it('is defined', function () {
      expect(TimeseriesFactory).to.not.equal(null);
    });
  });

  describe('getTimeseries', function () {
    it('chooses the correct parsing method', function () {
      var current,
          factory,
          legacy;

      factory = TimeseriesFactory();
      current = sinon.stub(factory, 'parseTimeseriesOptions',
          function () { return {}; });
      legacy = sinon.stub(factory, 'parseTimeseriesOptionsLegacy',
          function () { return {}; });

      factory.getTimeseries({observatory: 'BOU'});
      expect(legacy.callCount).to.equal(1);
      expect(current.callCount).to.equal(0);

      factory.getTimeseries({id: 'BOU'});
      expect(legacy.callCount).to.equal(1);
      expect(current.callCount).to.equal(1);

      current.restore();
      legacy.restore();
      factory.destroy();
    });

    it('makes an ajax call', function () {
      var factory,
          stub;

      factory = TimeseriesFactory();
      stub = sinon.stub(Xhr, 'ajax', function (o) { o.success({}); });

      factory.getTimeseries({});
      expect(stub.callCount).to.equal(1);

      stub.restore();
      factory.destroy();
    });

    it('has correct data', function (done) {
      var factory;

      factory = TimeseriesFactory({url: 'observatory_data.json'});

      factory.getTimeseries({
        callback: function (response) {
          var timeseries;

          timeseries = response.getTimeseries();

          expect(timeseries.length).to.equal(4);

          timeseries = timeseries[3];

          expect(timeseries.get('times').length).to.equal(1440);
          expect(timeseries.get('values').length).to.equal(1440);
          expect(timeseries.get('metadata').observatory).to.equal('BOU');
          expect(timeseries.get('metadata').channel).to.equal('F');
        done();
        },
        errback: function (err) {
          done(err);
        }
      });
    });
  });
});
