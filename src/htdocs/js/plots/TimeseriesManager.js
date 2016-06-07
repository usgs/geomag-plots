'use strict';

var Collection = require('mvc/Collection'),
    Model = require('mvc/Model'),
    Timeseries = require('plots/Timeseries'),
    TimeseriesFactory = require('plots/TimeseriesFactory'),
    TimeseriesManagerRequest = require('plots/TimeseriesManagerRequest'),
    Util = require('util/Util');


var _DEFAULTS = {};


/**
 * Manage timeseries for application.
 *
 * Creates model objects based on current configuration,
 * and requests data when time interval changes.
 *
 * @param options {Object}
 * @param options.config {Model}
 *     configuration.
 * @param options.elements {Collection}
 *     collection of elements.
 * @param options.factory {TimeseriesFactory}
 *     factory used to fetch data.
 * @param options.observatories {Collection}
 *     collection of observatories.
 * @param options.timeseries {Collection}
 *     collection of Timeseries objects to manage.
 */
var TimeseriesManager = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    _this.config = options.config || Model();
    _this.elements = options.elements || Collection();
    _this.factory = options.factory || TimeseriesFactory();
    _this.observatories = options.observatories || Collection();
    _this.timeseries = options.timeseries || Collection();

    // keep track of incomplete requests.
    _this.pendingRequests = [];

    _this.config.on('change', 'onConfigChange', _this);
  };


  /**
   * Abort any pending data requests.
   */
  _this.abortRequests = function () {
    _this.pendingRequests.forEach(function (request) {
      request.abort();
    });
    _this.pendingRequests = [];
  };

  /**
   * Reset collection based on currently selected elements and
   * observatories.
   */
  _this.createTimeseries = function () {
    var elements,
        models,
        observatories;

    // get current configuration
    elements = _this.config.get('elements') || [];
    observatories = _this.config.get('observatories') || [];

    // create models
    models = [];
    elements.forEach(function (elementId) {
      var element;
      element = _this.elements.get(elementId);
      observatories.forEach(function (observatoryId) {
        var id,
            model,
            observatory;
        observatory = _this.observatories.get(observatoryId);
        id = observatoryId + '_' + elementId;
        model = _this.timeseries.get(id);
        if (model === null) {
          model = Timeseries({
            id: id,
            element: element,
            observatory: observatory,
            times: [],
            values: []
          });
        }
        models.push(model);
      });
    });

    // reset timeseries collection
    _this.timeseries.reset(models);
  };

  /**
   * Destroy object and free references.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _this.abortRequests();

    _initialize = null;
    _this = null;
  };

  /**
   * Configuration "change" event handler.
   */
  _this.onConfigChange = function (changes) {
    if (!changes) {
      changes = _this.config.get();
    }

    if ('elements' in changes || 'observatories' in changes) {
      // update timeseries collection, then fetch data
      _this.createTimeseries();
      _this.fetchData();
    } else if ('starttime' in changes || 'endtime' in changes) {
      // new interval, fetch data
      _this.fetchData();
    }
  };

  /**
   * Fetch data for timeseries in collection.
   */
  _this.fetchData = function () {
    var endtime,
        sampling_period,
        starttime;

    // abort any existing requests
    _this.abortRequests();

    // figure out requested time
    endtime = _this.config.get('endtime');
    starttime = _this.config.get('starttime');
    // minutes data by default
    sampling_period = 60;
    if (endtime - starttime <= 1800000) {
      // 30 minutes or less
      sampling_period = 1;
    }

    // make new requests
    _this.timeseries.data().forEach(function (timeseries) {
      var request;

      request = _this.getTimeseriesRequest({
        endtime: endtime,
        sampling_period: sampling_period,
        starttime: starttime,
        timeseries: timeseries
      });

      _this.pendingRequests.push(request);
      request.start();
    });
  };

  /**
   * Create a TimeseriesManagerRequest object.
   *
   * @param options {Object}
   * @param options.endtime {Date}
   *     time of last sample.
   * @param options.sampling_period {Number}
   *     requested sampling_period.
   * @param options.starttime {Date}
   *     time of first sample.
   * @param options.timeseries {Timeseries}
   *     timeseries to request.
   */
  _this.getTimeseriesRequest = function (options) {
    var request;

    request = TimeseriesManagerRequest({
      callback: _this.onFetchComplete,
      endtime: options.endtime,
      factory: _this.factory,
      sampling_period: options.sampling_period,
      starttime: options.starttime,
      timeseries: options.timeseries
    });

    return request;
  };

  /**
   * Callback called when request is complete.
   */
  _this.onFetchComplete = function (request) {
    var index;

    // remove from pending requests
    index = _this.pendingRequests.indexOf(request);
    if (index !== -1) {
      _this.pendingRequests.splice(index, 1);
    }

    // destroy
    request.destroy();
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesManager;
