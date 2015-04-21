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
  var _this,
      _initialize,

      _height,
      _timeseries,
      _width,

      _trace;

  _this = View(options);

  _initialize = function (options) {
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
    _trace.destroy();
  }, _this.destroy);

  _this.render = function () {
    var meta = _timeseries.get('metadata'),
        metaView,
        traceView;

    metaView = document.createElement('div');
    metaView.className = 'meta-view';

    metaView.innerHTML = meta.observatory + ' ' + meta.channel + ' (nT)';
    _this.el.appendChild(metaView);

    traceView = document.createElement('div');
    traceView.className = 'trace-view';

    _trace = D3TimeseriesView({
      el: _this.el.appendChild(traceView),
      data: _timeseries,
      // title: meta.observatory,
      height: _height,
      width: _width,
      xAxisLabel: 'Time (UTC)',
      // yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)'
    }).render();
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
