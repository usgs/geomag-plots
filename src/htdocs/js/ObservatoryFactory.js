'use strict';

var Util = require('util/Util'),
    Xhr = require('util/Xhr'),

    Observatory = require('Observatory');


var _DEFAULTS = {
  url: 'http://geomag.usgs.gov/map/observatories.geojson.php'
};


/**
 * ObservatoryFactory factory uses ajax to retrieve observatory data.
 * @params options {object}
 *         all options are passed factory
 */
var ObservatoryFactory = function (options) {
  var _this,
      _initialize,
      // variables
      _url,
      // methods
      _parse;

  _this = {};

  // Sets up url for ajax call
  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);
    _url = options.url;
  };

  // ajax call gets observatory data
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

  // adds observatory data to the observatories array
  _parse = function (features) {
    var i,
        observatories = [];

    for (i = 0; i < features.length; i++) {
      observatories.push(_this.parseObservatory(features[i]));
    }

    return observatories;
  };

  // parses observatory data using observatory model
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
