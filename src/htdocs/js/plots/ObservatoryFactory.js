'use strict';

var Util = require('util/Util'),
    Xhr = require('util/Xhr'),

    Observatory = require('plots/Observatory');


var _DEFAULTS = {
  url: 'http://geomag.usgs.gov/map/observatories.geojson.php'
};


/**
 * ObservatoryFactory factory uses ajax to retrieve observatory data.
 *
 * @params options {object}
 *         all options are passed through factory.
 */
var ObservatoryFactory = function (options) {
  var _this,
      _initialize,
      // variables
      _url,
      // methods
      _parse;

  _this = {};


  /**
   * Extends options
   *
   * @param options {Object}
   * @param options.url {string}
   *        url for ajax call.
   */
  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);
    _url = options.url;
  };


  /**
   * Gets observatory data
   *
   * @param options {Object}
   * @param options.callback {Function(Array<Observatory>)}
   *        called after observatories are loaded.
   * @param options.errback {Function(Status, Xhr)}
   *        called when observatories don't load.
   */
  _this.getObservatories = function (options) {
    var callback = options.callback,
        errback = options.errback;

    Xhr.ajax({
      url: _url,
      success: function (data) {
        callback(_parse(data.features));
      },
      error: errback
    });
  };


  /**
   * Creates array of parsed observatories.
   *
   * @param features {Object}
   *        parsed features from GeoJSON feed.
   * @return {Array<Observatory>}
   *         parsed observatory added to observatories array.
   */
  _parse = function (features) {
    var i,
        observatories = [];

    for (i = 0; i < features.length; i++) {
      observatories.push(_this.parseObservatory(features[i]));
    }

    return observatories;
  };


  /**
   * Parse one observatory feature.
   *
   * @param features {Object}
   *        features from GeoJSON feed.
   * @return {Observatory}
   *         parsed Observatory model.
   */
  _this.parseObservatory = function (features) {
    var observatory,
        p = features.properties;

    observatory = Observatory({
      id: p.id,
      name: p.name,
      latitude: p.latitude,
      longitude: p.longitude
    });

    return observatory;
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = ObservatoryFactory;
