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

  describe('abort', function () {
    it('calls xhr.abort if xhr is active', function () {
      var abort,
          request;

      abort = sinon.stub();
      request = TimeseriesManagerRequest();
      request.xhr = {
        abort: abort
      };
      request.abort();
      expect(abort.calledOnce).to.equal(true);
      expect(request.xhr).to.equal(null);
    });

    it('does not call xhr.abort if xhr is null', function () {
      var request;

      request = TimeseriesManagerRequest();
      request.xhr = null;
      expect(request.abort).to.not.throw(Error);
    });
  });

  describe('destroy', function () {
    it('calls abort', function () {
      var request;

      request = TimeseriesManagerRequest();
      sinon.stub(request, 'abort', function () {});
      request.destroy();
      expect(request.abort.calledOnce).to.equal(true);
    });
  });

  describe('onDone', function () {
    it('calls callback when defined', function () {
      var callback,
          request;

      callback = sinon.stub();
      request = TimeseriesManagerRequest({
        callback: callback
      });

      request.onDone();
      expect(callback.calledOnce).to.equal(true);
    });

    it('does not try to call callback when not a function', function () {
      var request;

      request = TimeseriesManagerRequest();

      expect(request.onDone).to.not.throw(Error);
    });
  });

  describe('onError', function () {
    var request,
        response,
        timeseries;

    beforeEach(function () {
      timeseries = Model({
        element: {
          id: 'elementid'
        },
        observatory: {
          id: 'observatoryid'
        }
      });
      sinon.stub(timeseries, 'set', function () {});

      request = TimeseriesManagerRequest({
        timeseries: timeseries
      });
      sinon.stub(request, 'onDone', function () {});
      request.xhr = 'not null';
    });

    afterEach(function () {
      request = null;
      response = null;
      timeseries = null;
    });


    it('clears xhr reference', function () {
      request.onError();
      expect(request.xhr).to.equal(null);
    });

    it('sets timeseries error property', function () {
      request.onError('error message');
      expect(timeseries.set.calledOnce).to.equal(true);
      expect(timeseries.set.getCall(0).args[0].error).to.equal('error message');
    });

    it('uses a default error message if none specified', function () {
      request.onError();
      expect(timeseries.set.calledOnce).to.equal(true);
      expect(timeseries.set.getCall(0).args[0].error).to.equal('Error fetching data');
    });

    it('calls onDone', function () {
      request.onError();
      expect(request.onDone.calledOnce).to.equal(true);
    });
  });

  describe('onLoad', function () {
    var request,
        response,
        timeseries;

    beforeEach(function () {
      response = Model({
        times: [],
        values: []
      });

      timeseries = Model({
        element: {
          id: 'elementid'
        },
        observatory: {
          id: 'observatoryid'
        }
      });
      sinon.stub(timeseries, 'set', function () {});

      request = TimeseriesManagerRequest({
        timeseries: timeseries
      });
      sinon.stub(request, 'onDone', function () {});
      request.xhr = 'not null';

      request.onLoad(response);
    });

    afterEach(function () {
      request = null;
      response = null;
      timeseries = null;
    });


    it('clears xhr reference', function () {
      expect(request.xhr).to.equal(null);
    });

    it('calls timeseries.set', function () {
      expect(timeseries.set.calledOnce).to.equal(true);
      expect(timeseries.set.getCall(0).args[0].error).to.equal(false);
    });

    it('calls onDone', function () {
      expect(request.onDone.calledOnce).to.equal(true);
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
