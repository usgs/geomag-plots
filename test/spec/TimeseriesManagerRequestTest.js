/* global afterEach, beforeEach, chai, describe, it, sinon */
'use strict';

var Model = require('mvc/Model'),
    TimeseriesManagerRequest = require('plots/TimeseriesManagerRequest');


var expect = chai.expect;



describe('plots/TimeseriesManagerRequest', function () {

  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof TimeseriesManagerRequest).to.equal('function');
    });
  });

  describe('start', function () {
    var factory,
        timeseries,
        xhr;

    beforeEach(function () {
      xhr = {
        abort: sinon.stub()
      };
      factory = {
        getTimeseries: sinon.stub().returns(xhr)
      };
      timeseries = Model({
        element: {
          id: 'elementid'
        },
        observatory: {
          id: 'observatoryid'
        }
      });
    });

    afterEach(function () {
      xhr = null;
      factory = null;
      timeseries = null;
    });

    it('calls getTimeseries', function () {
      var request;

      request = TimeseriesManagerRequest({
        factory: factory,
        timeseries: timeseries
      });

      request.start();
      expect(factory.getTimeseries.calledOnce).to.equal(true);
      expect(request.xhr).to.equal(xhr);
    });

    it('can be aborted', function () {
      var request;

      request = TimeseriesManagerRequest({
        factory: factory,
        timeseries: timeseries
      });

      request.start();
      expect(xhr.abort.calledOnce).to.equal(false);
      request.abort();
      expect(xhr.abort.calledOnce).to.equal(true);
    });
  });

});
