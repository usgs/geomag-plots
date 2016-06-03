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
 * @param options.observatorys {Collection}
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
    _this.observatorys = options.observatorys || Collection();
    _this.timeseries = options.timeseries || Collection();

    // keep track of incomplete requests.
    _this.pendingRequests = [];

    _this.config.on('change', _this.onConfigChange);
    _this.timeseries.on('reset', _this.fetchData);
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
        observatorys;

    // get current configuration
    elements = _this.config.get('element');
    observatorys = _this.config.get('observatory');

    // create models
    models = [];
    elements.forEach(function (elementId) {
      var element;
      element = _this.elements.get(elementId);
      observatorys.forEach(function (observatoryId) {
        var id,
            model,
            observatory;
        observatory = _this.observatories.get(observatoryId);
        id = observatoryId + '_' + elementId;
        model = _this.timeseries.get(id);
        if (model === null) {
          model = Timeseries({
            element: element,
            observatory: observatory,
            times: [],
            values: []
          });
        }
        models.push(model);
      });
    });

    // sort by observatory latitude descending
    models.sort(_this.sortByObservatoryLatitudeDescending);

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

    if ('channel' in changes || 'observatory' in changes) {
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

      request = TimeseriesManagerRequest({
        callback: _this.onFetchComplete,
        endtime: endtime,
        factory: _this.factory,
        sampling_period: sampling_period,
        starttime: starttime,
        timeseries: timeseries
      });
      _this.pendingRequests.push(request);
      request.start();
    });
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

  /**
   * Sort function for Timeseries objects.
   *
   * @param a {Timeseries}
   *     first timeseries.
   * @param b {Timeseries}
   *     second timeseries.
   * @return {Number}
   *     {
   *        1: if a latitude is <  b latitude;
   *        0: if a latitude is == b latitude;
   *       -1: if a latitude is <  b latitude
   *     }
   */
  _this.sortByObservatoryLatitudeDescending = function (a, b) {
    var aLat,
        bLat;

    aLat = a.get('observatory').geometry.coords[1];
    bLat = b.get('observatory').geometry.coords[1];

    if (aLat < bLat) {
      return 1;
    } else if (aLat > bLat) {
      return -1;
    } else {
      return 0;
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesManager;
