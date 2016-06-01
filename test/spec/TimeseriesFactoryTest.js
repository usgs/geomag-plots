/* global chai, sinon, describe, it, before, after */
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
    var stub;
    before(function (){
      stub = sinon.stub(Xhr, 'ajax', function (options) {
        options.success({});
      });
    });
    after(function () {
      stub.restore();
    });


    it ('has correct data', function (done) {
      var timeseriesFactory = TimeseriesFactory({url:'data.json'});

      timeseriesFactory.getTimeseries({
        observatory:'BOU',
        channel: null,
        starttime: new Date(1429459810000),
        endtime: new Date(1429546200000),
        callback: function () {
          // check stub was called.
          expect(stub.callCount).to.equal(1);

          //check data args present as expected.
          expect(stub.getCall(0).args[0].data.starttime).to.equal(1429459810);
          expect(stub.getCall(0).args[0].data.endtime).to.equal(1429546200);
          expect(stub.getCall(0).args[0].data.freq).to.equal('minutes');
          expect(stub.getCall(0).args[0].data['obs[]']).to.equal('BOU');
        done();
        },
        error: function (err) {
          done(err);
        }
      });
    });
  });

});
