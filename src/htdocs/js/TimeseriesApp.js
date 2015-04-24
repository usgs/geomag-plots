/* global OffCanvas */
'use strict';


var Collection = require('mvc/Collection'),
    Model = require('mvc/Model'),
    View = require('mvc/View'),
    Util = require('util/Util'),

    TimeseriesCollectionView = require('TimeseriesCollectionView'),
    TimeseriesFactory = require('TimeseriesFactory'),
    TimeseriesSelectView = require('TimeseriesSelectView');


/**
 * Round a date up to the next N minute interval.
 *
 * @param dt {Date}
 *        date to round.
 * @param n {Integer}
 *        default 5.
 *        number of minutes to round to.
 *        e.g. 1: round up to nearest minute.
 *             5: round up to nearest 5 minutes.
 * @return {Date} rounded date.
 *         If dt is on a 5 minute interval, the return value is 5 minutes later.
 */
var __roundUpToNearestNMinutes = function (dt, n) {
  var y = dt.getUTCFullYear(),
      m = dt.getUTCMonth(),
      d = dt.getUTCDate(),
      h = dt.getUTCHours(),
      i = dt.getUTCMinutes();

  n = n || 5;
  // round i
  i = n * Math.floor((i + n) / n);
  return new Date(Date.UTC(y, m, d, h, i));
};


/**
 * Timeseries application.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.config {Model}
 *        configuration options.
 * @param options.configEl {DOMElement}
 *        optional, new element is inserted into options.el by default.
 *        element for TimeseriesSelectView.
 * @param options.timeseries {Array<Timeseries>}
 *        timeseries to display.
 */
var TimeseriesApp = function (options) {
  var _this,
      _initialize,
      // variables
      _config,
      _configView,
      _timeseries,
      _timeseriesFactory,
      _timeseriesView,
      // methods
      _onConfigChange,
      _onTimeseriesError,
      _onTimeseriesLoad;

  _this = View(options);

  _initialize = function (options) {
    var configEl = options.configEl,
        timeseriesEl = _this.el;

    if (!configEl) {
      timeseriesEl.innerHTML = '<div class="config"></div>' +
          '<div class="timeseries"></div>';
      configEl = timeseriesEl.querySelector('.config');
    } else {
      timeseriesEl.innerHTML = '<div class="timeseries"></div>';
    }
    timeseriesEl = timeseriesEl.querySelector('.timeseries');

    _config = Model(Util.extend({
      channel: 'H',
      endtime: null,
      observatory: null,
      starttime: null,
      timemode: 'pasthour'
    }, options.config));
    _config.on('change', _onConfigChange);

    _timeseries = options.timeseries || Collection();

    _timeseriesFactory = TimeseriesFactory();

    _configView = TimeseriesSelectView({
      el: configEl,
      channels: [
        // Add delta-F here when it is available in Edge.
        // Other channels should be added here when they are no longer beta.
        'H', 'E', 'Z', 'F'
      ],
      config: _config
    });

    _timeseriesView = TimeseriesCollectionView({
      el: timeseriesEl,
      collection: _timeseries
    });
    _onConfigChange();
  };

  /**
   * Configuration model "change" listener.
   */
  _onConfigChange = function () {
    var channel,
        endtime,
        seconds,
        observatory,
        starttime,
        timemode;

    if (typeof OffCanvas === 'object') {
      // hide offcanvas
      OffCanvas.getOffCanvas().hide();
    }

    channel = _config.get('channel');
    observatory = _config.get('observatory');
    timemode = _config.get('timemode');
    if (timemode === 'realtime') {
      // 15 minutes
      endtime = __roundUpToNearestNMinutes(new Date(), 1);
      starttime = new Date(endtime.getTime() - 900000);
    } else if (timemode === 'pastday') {
      endtime = __roundUpToNearestNMinutes(new Date(), 5);
      starttime = new Date(endtime.getTime() - 86400000);
    } else {
      endtime = _config.get('endtime');
      starttime = _config.get('starttime');
    }
    if ((endtime.getTime() - starttime.getTime()) <= 1800000) {
      seconds = true;
    } else {
      seconds = false;
    }

    _timeseriesFactory.getTimeseries({
      channel: channel,
      observatory: observatory,
      endtime: endtime,
      starttime: starttime,
      callback: _onTimeseriesLoad,
      errback: _onTimeseriesError,
      seconds: seconds
    });
  };

  /**
   * Errback for TimeseriesFactory.
   */
  _onTimeseriesError = function () {
    _timeseries.reset([]);
  };

  /**
   * Callback for TimeseriesFactory.
   *
   * @param response {TimeseriesResponse}
   *        timeseries webservice response.
   */
  _onTimeseriesLoad = function (response) {
    _timeseries.reset(response.getTimeseries());
  };

  /**
   * Destroy this application.
   */
  _this.destroy = Util.compose(function () {
    _config.off('change', _onConfigChange);
    _configView.destroy();
    _timeseriesView.destroy();

    _config = null;
    _configView = null;
    _timeseries = null;
    _timeseriesFactory = null;
    _timeseriesView = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesApp;
