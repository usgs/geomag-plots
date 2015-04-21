'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),

    D3TimeseriesView = require('D3TimeseriesView');


/**
 * Display a Timeseries Response model.
 *
 * @param options {Object}
 *        all options are passed to View.
 */
var TimeseriesView = function (options) {
  // defaults for width & height
  // bind the D3TimeseriesView
  // make the metaview
  var _this,
      _initialize,

      _height,
      _timeseries,
      _width;

  _this = View(options);

  _initialize = function (options) {
    _this.el.innerHTML = '<p>Timeseries View is here.</p>';

    _height = options.height || 240;
    _timeseries = options.timeseries;
    _width = options.width || 960;   // 480 looks better for mobile

    _this.render();
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _this = null;
  }, _this.destroy);

  _this.render = function () {
    var meta = _timeseries.get('metadata');
    console.log(_height);
    console.log(_width);
    D3TimeseriesView({
      el: _this.el.appendChild(document.createElement('div')),
      data: _timeseries,
      // title: meta.observatory,
      height: _height,
      width: _width,
      xAxisLabel: 'Time (UTC)',
      yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)'
    }).render();
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
