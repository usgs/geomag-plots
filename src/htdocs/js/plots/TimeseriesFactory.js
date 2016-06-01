'use strict';


var Formatter = require('util/Formatter'),
    TimeseriesResponse = require('plots/TimeseriesResponse'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr');


var _DEFAULTS = {
  url: 'http://geomag.usgs.gov//ws/edge/'
};


/**
 * TimeseriesFactory uses ajax to retrieve Timeseries
 *
 * @params options {Object}
 * @params options.url {String}
 *      get_geomag_data web service.
 */
var TimeseriesFactory = function (options) {
  var _this,
      _initialize,

      _url;


  _this = {};

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);
    _url = options.url;
  };


  /**
   * Makes certain everything is destroyed upon exit.
   */
  _this.destroy = function () {
    _url = null;

    _initialize = null;
    _this = null;
  };

  /**
   * Fetches timeseries data based on the given options. This method occurs
   * asynchronously and provides the resulting {TimeseriesResponse} object via
   * the provided options.callback function.
   *
   * @param options.callback {Function}
   *     The callback function to call when a request succeeds
   * @param options.errback {Fucntion}
   *     The callback function to call when a request fails
   * @param options... {Mixed}
   *     Additional options to provide to either `parseTimeseriesOptions` or
   *     `parseTimeseriesOptionsLegacy`. See those methods for additional
   *     documentation details.
   */
  _this.getTimeseries = function (options) {
    var callback,
        data,
        errback;

    if (options.hasOwnProperty('observatory') ||
        options.hasOwnProperty('channel') ||
        options.hasOwnProperty('seconds')) {
      data = _this.parseTimeseriesOptionsLegacy(options);
    } else {
      data = _this.parseTimeseriesOptions(options);
    }

    callback = options.callback || function () {};
    errback = options.errback || function () {};

    Xhr.ajax({
      url: _url,
      data: data,
      success: function (response) {
        var responseObject;

        try {
          responseObject = JSON.parse(response);
        } catch (e) {
          responseObject = response;
        }

        callback(TimeseriesResponse(responseObject));
      },
      error: errback
    });
  };

  /**
   * Parse the given options into a data object that can be provided to an
   * XHR call. The data object will conform to the edge web service API.
   *
   * See http://geomag.usgs.gov/ws/edge/ for more documentation about
   * each configuration option.
   *
   * @param options.elements {String|Array}
   *     The elements (channels) to fetch
   * @param options.endtime {Date}
   *     The end of the time window of interest
   * @param options.id {String}
   *     Observatory id
   * @param options.sampling_period {Integer}
   *     Sampling period in seconds
   * @param options.starttime {Date}
   *     The start of the time window of interest
   * @param options.type {String}
   *     The type of data to fetch.
   *
   */
  _this.parseTimeseriesOptions = function (options) {
    var data;

    data = {};

    if (options.id) {
      data.id = options.id;
    }

    if (options.starttime) {
      data.starttime = Formatter.iso8601(options.starttime);
    }

    if (options.endtime) {
      data.endtime = Formatter.iso8601(options.endtime);
    }

    if (options.elements) {
      if (Array.isArray(options.elements)) {
        data.elements = options.elements.join(',');
      } else {
        data.elements = options.elements;
      }
    }

    if (options.sampling_period) {
      data.sampling_period = options.sampling_period;
    }

    if (options.type) {
      data.type = options.type;
    }

    data.format = 'json';

    return data;
  };

  /**
   * @deprecated
   *
   * getTimeseries from webservice.
   *
   * @param options {Object}
   * @param options.observatory {String}
   *      default null
   *      observatory to request or null for all
   * @param options.channel {String}
   *      default null
   *      channel to request or null for all
   * @param options.starttime {Date}
   *      first requested sample
   * @param options.endtime {Date}
   *      last requested sample
   * @param options.callback {Function(TimeseriesResponse)}
   *      called after data is succesfully loaded
   * @param options.errback {Function(status,Xhr)}
   *      called if there are Errors
   * @param options.seconds {Boolean}
   *      default false
   *      whether to load seconds data (true) or minutes data (false)
   *
   * @return {TimeseriesResponse}
   *      Response from webservice, in a TimeseriesResponse object
   */
  _this.parseTimeseriesOptionsLegacy = function (options) {
    var starttime = options.starttime || new Date(),
        endtime = options.endtime || new Date(),
        observatory = options.observatory || null,
        channel = options.channel || null,
        seconds = options.seconds || false,
        data = {};

    console.log('Using deprecated timeseries factory API');

    // Change seconds from a boolean to the string expected by get_geomag_data
    if (seconds) {
      if (endtime.getTime() - starttime.getTime() > 1800000) {
        throw new Error(
            'Seconds data can only be requested 30 minutes at a time.');
      }
      seconds = 1;
    } else {
      seconds = 60;
    }

    data.format = 'json';
    data.starttime = Formatter.iso8601(starttime);
    data.endtime = Formatter.iso8601(endtime);
    data.sampling_period = seconds;

    if (observatory !== null) {
      data.id = observatory;
    }

    if (channel !== null) {
      if (Array.isArray(channel)) {
        data.elements = channel.join(',');
      } else {
        data.elements = channel;
      }
    }

    return data;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesFactory;
