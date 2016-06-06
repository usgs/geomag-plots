/* global afterEach, beforeEach, chai, describe, it, sinon */
'use strict';


var Model = require('mvc/Model'),
    TimeseriesManager = require('plots/TimeseriesManager');


var expect = chai.expect;


describe('plots/TimeseriesManager', function () {

  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof TimeseriesManager).to.equal('function');
    });

    it('binds config change to onConfigChange', function () {
      var manager;

      manager = TimeseriesManager();
      sinon.stub(manager, 'onConfigChange', function () {});

      expect(manager.onConfigChange.calledOnce).to.equal(false);
      manager.config.trigger('change');
      expect(manager.onConfigChange.calledOnce).to.equal(true);
    });
  });

  describe('abortRequests', function () {
    it('aborts any pending requests', function () {
      var manager,
          pendingRequests;

      manager = TimeseriesManager();

      pendingRequests = [
        {abort: sinon.stub()},
        {abort: sinon.stub()}
      ];
      manager.pendingRequests = pendingRequests;

      manager.abortRequests();
      pendingRequests.forEach(function (r) {
        expect(r.abort.calledOnce).to.equal(true);
      });
      expect(manager.pendingRequests.length).to.equal(0);
    });
  });

  describe('createTimeseries', function () {
    var manager;

    beforeEach(function () {
      manager = TimeseriesManager();
      sinon.stub(manager, 'fetchData', function () {});
      manager.observatorys.reset([
        {
          id: 'A',
          geometry: {
            coordinates: [0, 1]
          }
        },
        {
          id: 'B',
          geometry: {
            // b latitude is greater than a latitude
            coordinates: [0, 2]
          }
        }
      ], {silent: true});
    });

    afterEach(function () {
      manager = null;
    });


    it('creates timeseries and resets collection', function () {
      expect(manager.timeseries.data().length).to.equal(0);
      manager.config.set({
        elements: ['A', 'B'],
        observatorys: ['A']
      }, {silent: true});
      manager.createTimeseries();

      expect(manager.timeseries.get('A_A')).to.not.equal(null);
      expect(manager.timeseries.get('A_B')).to.not.equal(null);
    });

    it('reuses existing timeseries', function () {
      var existing;

      expect(manager.timeseries.data().length).to.equal(0);
      manager.config.set({
        elements: ['A', 'B'],
        observatorys: ['A']
      }, {silent: true});
      manager.createTimeseries();

      existing = manager.timeseries.get('A_A');
      manager.config.set({
        elements: ['A'],
        observatorys: ['A', 'B']
      }, {silent: true});
      manager.createTimeseries();

      expect(manager.timeseries.get('A_A')).to.equal(existing);
      expect(manager.timeseries.get('A_B')).to.equal(null);
      expect(manager.timeseries.get('B_A')).to.not.equal(null);
    });

    it('sorts by observatory latitude descending', function () {
      manager.config.set({
        elements: ['A'],
        observatorys: ['A', 'B']
      }, {silent: true});
      manager.createTimeseries();

      expect(manager.timeseries.data()[0].id).to.equal('B_A');
      expect(manager.timeseries.data()[1].id).to.equal('A_A');
    });
  });

  describe('destroy', function () {
    it('calls abortRequests', function () {
      var manager;

      manager = TimeseriesManager();
      sinon.stub(manager, 'abortRequests');
      manager.destroy();
      expect(manager.abortRequests.calledOnce).to.equal(true);
    });
  });

  describe('onConfigChange', function () {
    var manager;

    beforeEach(function () {
      manager = TimeseriesManager();
      sinon.stub(manager, 'createTimeseries', function () {});
      sinon.stub(manager, 'fetchData', function () {});
    });

    afterEach(function () {
      manager = null;
    });

    it('does not call createTimeseries/fetchData when no changes', function () {
      manager.onConfigChange({});
      expect(manager.createTimeseries.callCount).to.equal(0);
      expect(manager.fetchData.callCount).to.equal(0);
    });

    it('calls fetchData when starttime/endtime change', function () {
      manager.onConfigChange({
        starttime: true
      });
      expect(manager.createTimeseries.callCount).to.equal(0);
      expect(manager.fetchData.callCount).to.equal(1);
      manager.onConfigChange({
        endtime: true
      });
      expect(manager.createTimeseries.callCount).to.equal(0);
      expect(manager.fetchData.callCount).to.equal(2);
      manager.onConfigChange({
        starttime: true,
        endtime: true
      });
      expect(manager.createTimeseries.callCount).to.equal(0);
      expect(manager.fetchData.callCount).to.equal(3);
    });

    it('calls createTimeseries when element/observatory change', function () {
      manager.onConfigChange({
        elements: true
      });
      expect(manager.createTimeseries.callCount).to.equal(1);
      expect(manager.fetchData.callCount).to.equal(1);
      manager.onConfigChange({
        observatorys: true
      });
      expect(manager.createTimeseries.callCount).to.equal(2);
      expect(manager.fetchData.callCount).to.equal(2);
      manager.onConfigChange({
        elements: true,
        observatorys: true
      });
      expect(manager.createTimeseries.callCount).to.equal(3);
      expect(manager.fetchData.callCount).to.equal(3);
    });
  });

  describe('fetchData', function () {
    var manager,
        request;

    beforeEach(function () {
      manager = TimeseriesManager();
      request = {
        start: sinon.stub()
      };
      sinon.stub(manager, 'abortRequests', function () {});
      sinon.stub(manager, 'getTimeseriesRequest', function () {
        return request;
      });
    });

    afterEach(function () {
      manager = null;
    });


    it('calls abortRequests', function () {
      manager.fetchData();
      expect(manager.abortRequests.calledOnce).to.equal(true);
    });

    it('uses 1 second sampling_period when <= 30 mintues', function () {
      var args,
          timeseries;

      timeseries = {};
      manager.config.set({
        starttime: new Date('2016-05-01T00:00:00Z'),
        endtime: new Date('2016-05-01T00:30:00Z')
      }, {silent: true});
      manager.timeseries.reset([timeseries], {silent: true});

      manager.fetchData();
      expect(manager.getTimeseriesRequest.calledOnce).to.equal(true);
      args = manager.getTimeseriesRequest.getCall(0).args[0];
      expect(args.timeseries).to.equal(timeseries);
      expect(args.sampling_period).to.equal(1);
    });

    it('uses 1 minute sampling_period when > 30 mintues', function () {
      var args,
          timeseries;

      timeseries = {};
      manager.config.set({
        starttime: new Date('2016-05-01T00:00:00Z'),
        endtime: new Date('2016-05-01T00:30:01Z')
      }, {silent: true});
      manager.timeseries.reset([timeseries], {silent: true});

      manager.fetchData();
      expect(manager.getTimeseriesRequest.calledOnce).to.equal(true);
      args = manager.getTimeseriesRequest.getCall(0).args[0];
      expect(args.timeseries).to.equal(timeseries);
      expect(args.sampling_period).to.equal(60);
    });

    it('adds requests to pending, and starts request', function () {
      manager.timeseries.reset([{}], {silent: true});
      manager.fetchData();
      expect(manager.pendingRequests[0]).to.equal(request);
      expect(request.start.calledOnce).to.equal(true);
    });
  });

  describe('getTimeseriesRequest', function () {
    it('passes arguments to TimeseriesManagerRequest', function() {
      var manager,
          request;

      manager = TimeseriesManager();
      request = manager.getTimeseriesRequest({
        endtime: 'endtime',
        sampling_period: 'sampling period',
        starttime: 'starttime',
        timeseries: 'timeseries'
      });

      expect(request.callback).to.equal(manager.onFetchComplete);
      expect(request.endtime).to.equal('endtime');
      expect(request.factory).to.equal(manager.factory);
      expect(request.sampling_period).to.equal('sampling period');
      expect(request.starttime).to.equal('starttime');
      expect(request.timeseries).to.equal('timeseries');
    });
  });

  describe('onFetchComplete', function () {
    it('removes request from pending', function () {
      var manager,
          request;

      manager = TimeseriesManager();
      request = {
        destroy: sinon.stub()
      };
      manager.pendingRequests.push(request);
      manager.onFetchComplete(request);
      expect(manager.pendingRequests.length).to.equal(0);
      expect(request.destroy.calledOnce).to.equal(true);
    });
  });

  describe('sortByObservatoryLatitudeDescending', function () {
    it('sorts as expected', function () {
      var lowerTimeseries,
          func,
          upperTimeseries;

      lowerTimeseries = Model({
        observatory: {
          geometry: {
            coordinates: [0, 1]
          }
        }
      });
      upperTimeseries = Model({
        observatory: {
          geometry: {
            coordinates: [0, 2]
          }
        }
      });
      func = TimeseriesManager().sortByObservatoryLatitudeDescending;

      expect(func(lowerTimeseries, upperTimeseries)).to.equal(1);
      expect(func(upperTimeseries, lowerTimeseries)).to.equal(-1);
      expect(func(lowerTimeseries, lowerTimeseries)).to.equal(0);
    });
  });

});
