/* global OffCanvas */
'use strict';


var Collection = require('mvc/Collection'),
    Model = require('mvc/Model'),
    View = require('mvc/View'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr'),

    TimeseriesCollectionView = require('plots/TimeseriesCollectionView'),
    TimeseriesFactory = require('plots/TimeseriesFactory'),
    TimeseriesManager = require('plots/TimeseriesManager'),
    TimeseriesSelectView = require('plots/TimeseriesSelectView');


var _DEFAULTS = {
  elementsMetaUrl: '/ws/edge/elements.json',
  obsMetaUrl: '/ws/edge/observatories.json',
  obsDataUrl: '/ws/edge/'
};


/**
 * Timeseries application.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.channels {Array}
 *        channels to display, passed to ChannelSelectView.
 * @param options.config {Model}
 *        configuration options.
 * @param options.configEl {DOMElement}
 *        optional, new element is inserted into options.el by default.
 *        element for TimeseriesSelectView.
 * @param observatories {Collection}
 *        default Collection().
 *        collection of observatories for reference.
 * @param observatoryFactory {ObservatoryFactory}
 *        default ObservatoryFactory().
 *        observatory factory used to populate observatories collection,
 *        if collection is not configured.
 * @param options.timeseries {Array<Timeseries>}
 *        timeseries to display.
 */
var TimeseriesApp = function (options) {
  var _this,
      _initialize,

      _configView,
      _descriptionEl,
      _observatories,
      _timeseriesEl,
      _timeseriesFactory,
      _timeseriesView,
      _onConfigChange,
      _onTimeseriesError,
      _onTimeseriesLoad;

  _this = View(options);

  _initialize = function (options) {
    var configEl,
        el,
        viewEl;

    options = Util.extend({}, _DEFAULTS, options);
    configEl = options.configEl;
    el = _this.el;

    el.classList.add('timeseries-app');
    el.innerHTML =
        '<div class="description"></div>' +
        '<div class="view"></div>' +
        '<div class="load">' +
          '<div class="load-mask"></div>' +
          '<span class="load-text">LOADING</span>' +
        '</div>';

    if (!configEl) {
      el.insertAdjacentHTML('afterbegin', '<div class="config"></div>');
      configEl = el.querySelector('.config');
    }

    _descriptionEl = el.querySelector('.description');
    viewEl = el.querySelector('.view');

    _this.config = Model(Util.extend({
      channel: ['H', 'E', 'Z', 'F'],
      elements: null,
      endtime: null,
      observatories: null,
      starttime: null,
      timemode: 'pastday'
    }, options.config));

    _this.elements = Collection();
    _this.observatories = Collection();
    _this.timeseries = Collection();

    _timeseriesFactory = TimeseriesFactory({
      observatories: _this.observatories,
      url: options.obsDataUrl
    });

    _this.timeseriesManager = TimeseriesManager({
      config: _this.config,
      elements: _this.elements,
      factory: _timeseriesFactory,
      observatories: _this.observatories,
      timeseries: _this.timeseries
    });

    _this.plotModel = Model({
      //TODO all the things
    });

    _configView = TimeseriesSelectView({
      channels: options.channels || ['H', 'E', 'Z', 'F'],
      config: _this.config,
      el: configEl,
      elements: _this.elements,
      observatories: _this.observatories,
      plotModel: _this.plotModel
    });

    _timeseriesView = TimeseriesCollectionView({
      el: viewEl,
      collection: _this.timeseries,
      model: _this.plotModel
    });
    _timeseriesEl = el;

    _this.elements.on('reset', _this.onCollectionLoad);
    _this.observatories.on('reset', _this.onCollectionLoad);

    _this.loadCollection({
      collection: _this.elements,
      url: options.elementsMetaUrl
    });
    _this.loadCollection({
      collection: _this.observatories,
      filter: function (obs) {
        return obs.properties.agency === 'USGS';
      },
      sort: _this.sortByLatitudeDescending,
      url: options.obsMetaUrl
    });

    //Calling onTimeChange sets the time in config,
    //which triggers _onConfigChange
    _configView.setPastDay();
  };

  /**
   * Load a collection from a geojson url.
   *
   * @param options {Object}
   * @param options.collection {Collection}
   *     collection to load.
   * @param options.filter {Function}
   *     optional filter function for features.
   * @param options.sort {Function}
   *     optional sort function for features.
   * @param options.url {String}
   *     url containing collection data in geojson format.
   */
  _this.loadCollection = function (options) {
    var collection,
        url;

    collection = options.collection;
    url = options.url;

    collection.loaded = false;
    Xhr.ajax({
      url: url,
      success: function (data) {
        var features;

        features = data.features;
        if (typeof options.filter === 'function') {
          features = features.filter(options.filter);
        }
        if (typeof options.sort === 'function') {
          features.sort(options.sort);
        }

        collection.error = false;
        collection.loaded = true;
        collection.reset(features);
      },
      error: function (err) {
        collection.error = err;
        collection.loaded = true;
        collection.reset([]);
      }
    });
  };

  /**
   * Called after collections have loaded.
   */
  _this.onCollectionLoad = function () {
    if (_this.elements.loaded && _this.observatories.loaded) {
      _this.elements.selectById('H');
    }
  };

  /**
   * Configuration model "change" listener.
   */
  _onConfigChange = function () {
    var channel,
        endtime,
        seconds,
        observatory,
        starttime;

    if (typeof OffCanvas === 'object') {
      // hide offcanvas
      OffCanvas.getOffCanvas().hide();
    }

    channel = _this.config.get('channel');
    observatory = _this.config.get('observatory');

    endtime = _this.config.get('endtime');
    starttime = _this.config.get('starttime');

    if ((endtime.getTime() - starttime.getTime()) <= 1800000) {
      seconds = true;
    } else {
      seconds = false;
    }

    _timeseriesEl.classList.add('loading');
    _this.config.set({
      starttime: starttime,
      endtime: endtime
    }, {silent: true});

    _timeseriesFactory.getTimeseries({
      elements: channel,
      id: observatory,
      endtime: endtime,
      starttime: starttime,
      callback: _onTimeseriesLoad,
      errback: _onTimeseriesError,
      sampling_period: (seconds ? 1 : 60)
    });
  };

  /**
   * Errback for TimeseriesFactory.
   */
  _onTimeseriesError = function () {
    var config,
        el;

    el = _this.el.querySelector('.view');
    config = _this.config.get();
    if (config) {
      el.innerHTML =
        '<p class="alert error">Failed to load data for, ' +
          (config.channel ?
              'channel: ' + config.channel :
              'observatory: ' +config.observatory) +
        '</p>';
    }

    _timeseriesEl.classList.remove('loading');
    _this.timeseries.reset([]);
  };

  /**
   * Callback for TimeseriesFactory.
   *
   * @param response {TimeseriesResponse}
   *        timeseries webservice response.
   */
  _onTimeseriesLoad = function (response) {
    var timeseries = response.getTimeseries();
    // copy metadata from observatory to timeseries
    timeseries.forEach(function (t) {
      var coords,
          metadata,
          observatory,
          props;

      metadata = t.get('metadata');
      observatory = _this.observatories.get(metadata.observatory);
      if (observatory !== null) {
        coords = observatory.geometry.coordinates;
        props = observatory.properties;
        Util.extend(metadata, {
          name: props.name,
          latitude: coords[1],
          longitude: coords[0]
        });
      }
    });
    // sort by latitude
    timeseries.sort(function (a, b) {
      var aMeta = a.get('metadata'),
          bMeta = b.get('metadata'),
          aKey,
          bKey;
      // sort by latitude if available
      aKey = aMeta.latitude;
      bKey = bMeta.latitude;
      if (aKey && bKey) {
        return bKey - aKey;
      }
      // otherwise observatory code
      aKey = aMeta.observatory;
      bKey = bMeta.observatory;
      if (aKey < bKey) {
        return -1;
      } else if (bKey < aKey) {
        return 1;
      }
      return 0;
    });
    // update collection
    _this.timeseries.reset(timeseries);
    // done loading
    _timeseriesEl.classList.remove('loading');
  };

  /**
   * Destroy this application.
   */
  _this.destroy = Util.compose(function () {
    _this.config.off('change', _onConfigChange);
    _configView.destroy();
    _timeseriesView.destroy();

    _configView = null;
    _descriptionEl = null;
    _observatories = null;
    _timeseriesEl = null;
    _timeseriesFactory = null;
    _timeseriesView = null;
    _this = null;
  }, _this.destroy);


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
  _this.sortByLatitudeDescending = function (a, b) {
    var aLat,
        bLat;

    if (!a.geometry || !a.geometry.coordinates ||
        !b.geometry || !b.geometry.coordinates) {
      // no latitudes to compare
      return 0;
    }

    aLat = a.geometry.coordinates[1];
    bLat = b.geometry.coordinates[1];
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

module.exports = TimeseriesApp;
