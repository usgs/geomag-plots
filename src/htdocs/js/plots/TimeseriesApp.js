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
 * @param options.elements {Array}
 *        elements to display, passed to CompactSelectView.
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
      _timeseriesView;

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
      yExtentSize: null
    });

    _configView = TimeseriesSelectView({
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
      url: options.obsMetaUrl
    });

    _this.config.on('change', _this.onConfigChange);

    //Calling setPastDay sets the time in config,
    //which triggers TimeseriesManager
    _configView.setPastDay();
  };

  /**
   * Load a collection from a geojson url.
   *
   * @param options {Object}
   * @param options.collection {Collection}
   *     collection to load.
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
        collection.error = false;
        collection.loaded = true;
        if (typeof options.filter === 'function') {
          collection.reset(data.features.filter(options.filter));
        } else {
          collection.reset(data.features);
        }
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
  _this.onConfigChange = function () {
    if (typeof OffCanvas === 'object') {
      // hide offcanvas
      OffCanvas.getOffCanvas().hide();
    }
  };

  /**
   * Destroy this application.
   */
  _this.destroy = Util.compose(function () {
    _this.config.off('change', _this.onConfigChange);
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


  _initialize(options);
  options = null;
  return _this;
};

module.exports = TimeseriesApp;
