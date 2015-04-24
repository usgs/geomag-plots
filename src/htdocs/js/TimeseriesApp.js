/* global OffCanvas */
'use strict';


var Collection = require('mvc/Collection'),
    Model = require('mvc/Model'),
    View = require('mvc/View'),
    Util = require('util/Util'),

    ObservatoryFactory = require('ObservatoryFactory'),
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
      _formatDate,
      _titleEl,
      _timeseriesEl,
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
        viewEl = _this.el,
        titleDiv = '<div class="title"></div>',
        timeseriesDiv = '<div class="timeseries">'+
            '<div class="view"></div>' +
            '<div class="load">LOADING</div>' +
            '</div>';

    if (!configEl) {
      viewEl.innerHTML = '<div class="config"></div>' +
          titleDiv + timeseriesDiv;
      configEl = viewEl.querySelector('.config');
    } else {
      viewEl.innerHTML = titleDiv + timeseriesDiv;
    }
    _titleEl = viewEl.querySelector('.title');
    viewEl = viewEl.querySelector('.view');

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
      config: _config
    });

    _timeseriesView = TimeseriesCollectionView({
      el: viewEl,
      collection: _timeseries
    });

    _timeseriesEl = _this.el.querySelector('.timeseries');
    ObservatoryFactory().getObservatories({
      callback: function (observatories) {
        _this.observatories = observatories;
        _onConfigChange();
      },
      errback: function () { console.log('ObservatoryFactory Error');}
    });

  };

  _formatDate = function (d) {
    if (!d || typeof d.toISOString !== 'function') {
      return '';
    }
    return d.toISOString().replace('T', ' ').replace(/\.[\d]{3}Z/, '');
  };

  /**
   * Configuration model "change" listener.
   */
  _onConfigChange = function () {
    var channel,
        endtime,
        starttime,
        name,
        observatory,
        observatoryObject,
        seconds,
        timemode,
        timeTitle,
        title;

    if (typeof OffCanvas === 'object') {
      // hide offcanvas
      OffCanvas.getOffCanvas().hide();
    }

    channel = _config.get('channel');
    observatory = _config.get('observatory');
    timeTitle = timemode = _config.get('timemode');
    if (timemode === 'realtime') {
      // 15 minutes
      endtime = __roundUpToNearestNMinutes(new Date(), 1);
      starttime = new Date(endtime.getTime() - 900000);
      timeTitle = '<span class="timespan"> Past 15 minutes </span>';
    } else if (timemode === 'pastday') {
      endtime = __roundUpToNearestNMinutes(new Date(), 5);
      starttime = new Date(endtime.getTime() - 86400000);
      timeTitle = '<span class="timespan"> Past Day </span>';
    } else {
      endtime = _config.get('endtime');
      starttime = _config.get('starttime');
      timeTitle = '<span class="timespan"> Times Range: ' +
          _formatDate(starttime) + ' to ' + _formatDate(endtime) +
          '</span>';
    }

    if ((endtime.getTime() - starttime.getTime()) <= 1800000) {
      seconds = true;
    } else {
      seconds = false;
    }

    // Get Observatory Name.
    if (observatory && _this.observatories !== undefined) {
      _this.observatories.forEach(function(obs) {
        if (observatory === obs.id) {
          observatoryObject = obs;
        }
      });
     name = '<span .title3> ' + observatoryObject.get('name') + '</span></br>';
    }
    else {
      name = '';
    }

    title = observatory || channel;
    if (channel) {
      title = channel + ' for all observatories.';
    }
    else {
      title = observatory;
    }
    _titleEl.innerHTML = '<h2>' + title + '</h2> ' + name +
        timeTitle + '<br> <span class="timezone">All times are in UTC<span>';

    _timeseriesEl.classList.add('loading');

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
    _timeseriesEl.classList.remove('loading');
    _timeseries.reset([]);
  };

  /**
   * Callback for TimeseriesFactory.
   *
   * @param response {TimeseriesResponse}
   *        timeseries webservice response.
   */
  _onTimeseriesLoad = function (response) {
    _timeseriesEl.classList.remove('loading');
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
