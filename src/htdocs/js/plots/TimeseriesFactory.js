'use strict';

var Util = require('util/Util'),
    Xhr = require('util/Xhr'),

    TimeseriesResponse = require('plots/TimeseriesResponse');


var _DEFAULTS = {
  url: 'http://geomag.usgs.gov/map/observatories_data.json.php'
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
    _this = null;
  };

  /**
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
  _this.getTimeseries = function(options) {
    var starttime = options.starttime || new Date(),
        endtime = options.endtime || new Date(),
        observatory = options.observatory || null,
        channel = options.channel || null,
        callback = options.callback || function () {},
        errback = options.errback || function () {},
        seconds = options.seconds || false,
        data = {};

    // Came in as a date,  change to seconds.
    starttime = Math.floor(starttime.getTime()/1000);
    endtime = Math.ceil(endtime.getTime()/1000);

    // Change seconds from a boolean to the string expected by get_geomag_data
    if (seconds) {
      if (endtime - starttime > 1800) {
        throw new Error(
            'Seconds data can only be requested 30 minutes at a time.');
      }
      seconds = 'seconds';
    } else {
      seconds = 'minutes';
    }

    data.starttime = starttime;
    data.endtime = endtime;
    data.freq = seconds;
    if (observatory !== null) {
      data['obs[]'] = observatory;
    }
    if (channel !== null) {
      data['chan[]'] = channel;
    }

    Xhr.ajax({
      url: _url,
      data: data,
      success: function (response) {
        callback(TimeseriesResponse(response));
      },
      error: errback
    });
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesFactory;
