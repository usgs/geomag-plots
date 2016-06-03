'use strict';

var Util = require('util/Util');


var _DEFAULTS = {};


/**
 * Manage request for a single timeseries.
 *
 * @param options {Object}
 * @param options.callback {Function}
 *     callback when request is complete.
 * @param options.endtime {Date}
 *     time of last sample to fetch.
 * @param options.factory {TimeseriesFactory}
 *     timeseries factory for request.
 * @param options.sampling_period {Number}
 *     sampling period to fetch.
 * @param options.starttime {Date}
 *     time of first sample to fetch.
 * @param options.timeseries {Timeseries}
 *     Timeseries to fetch data into.
 */
var TimeseriesManagerRequest = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    _this.callback = options.callback;
    _this.endtime = options.endtime;
    _this.factory = options.factory;
    _this.sampling_period = options.sampling_period;
    _this.starttime = options.starttime;
    _this.timeseries = options.timeseries;
    _this.xhr = null;
  };


  /**
   * Abort request if still active.
   */
  _this.abort = function () {
    if (_this.xhr !== null) {
      _this.xhr.abort();
    }
  };

  /**
   * Destroy this object and free references.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _this.abort();

    _initialize = null;
    _this = null;
  };

  /**
   * Callback after request is complete, successfully or not.
   */
  _this.onDone = function () {
    if (typeof _this.callback === 'function') {
      _this.callback(_this);
    }
  };

  /**
   * Callback after request error.
   *
   * @param err
   */
  _this.onError = function (err) {
    // request is complete
    _this.xhr = null;

    _this.timeseries.set({
      // make sure "error" is truthy
      error: err || 'Error fetching data',
      metadata: {},
      times: [],
      values: []
    });

    _this.onDone();
  };

  /**
   * Callback after request completes successfully.
   *
   * @param response {TimeseriesResponse}
   *     the response.
   */
  _this.onLoad = function (response) {
    var metadata,
        times,
        values;

    // request is complete
    _this.xhr = null;

    metadata = {};

    times = response.get('times').map(function (t) {
      return new Date(Date.parse(t));
    });

    values = response.get('values');
    if (values && values.length > 0) {
      values = values[0];
      metadata = values.metadata;
      values = values.values;
    } else {
      values = [];
    }

    _this.timeseries.set({
      error: false,
      metadata: metadata,
      times: times,
      values: values
    });

    _this.onDone();
  };

  /**
   * Request data.
   */
  _this.start = function () {
    var timeseries;

    if (_this.xhr) {
      // only make one request at a time
      _this.abort();
    }

    timeseries = _this.timeseries;
    // TODO: clear timeseries data or set loading status
    //     may be bad if updating, but other portions of interface will already
    //     display new starttime/endtime

    // TODO: check data already in timeseries and/or incrementally request.
    _this.xhr = _this.factory.getTimeseries({
      elements: timeseries.get('element').id,
      id: timeseries.get('observatory').id,
      endtime: _this.endtime,
      starttime: _this.starttime,
      sampling_period: _this.sampling_period,
      callback: _this.onLoad,
      errback: _this.onError
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesManagerRequest;
