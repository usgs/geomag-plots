'use strict';


var Util = require('util/Util'),
    Xhr = require('util/Xhr');

var _DEFAULTS = {
  url: null
};

var TimeseriesFactory = function (params) {
  var _this,
      _initialize,

      _params;

_this = {};

_initialize = function (params) {
  _params = Util.extend({}, _DEFAULTS, params);
};

/**
 * @param options {Object}
 *  observatory: string
 *      default: null
 *      observatory to request or null for all
 *  channel: string
 *      default: null
 *      channel to request or null for all
 *  starttime: Date
 *      first requested sample
 *  endtime: Date
 *      last requested sample
 *  callback: function(TimesereisResponse)
 *      called after data is succesfully loaded
 *  errback: function(Xhr)
 *      called if there are Errors
 *  seconds: boolean
 *      default: false
 *      whether to load seconds data (true) or minutes data (false)
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

  Xhr.jsonp({
    url: _params.url,
    data: data,
    callbackName: 'timeseriesFactoryCallback',
    callbackParameter: 'callback',
    success: function (response) {
      callback(response);
    },
    error: function () {
      errback();
    }
  });
};

_initialize(params);
params = null;
return _this;
};

module.exports = TimeseriesFactory;
