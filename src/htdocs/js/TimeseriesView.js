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

      _timeseries;

  _this = View(options);

  _initialize = function (options) {
    _this.el.innerHTML = '<p>Timeseries View is here.</p>';

    _timeseries = options.timeseries;
    // var series = TimeseriesResponse();
    // console.log(series);

    // _el.innerHTML = [
    //   '<div class="meta-data"></div>',
    //   '<div class="trace-data"></div>'
    // ].join('');

    // _meta = _el.querySelector('meta-data');
    // _trace = _el.querySelector('trace-data');

    // _meta.innerHTML = 'Meta';
    // _trace.innerHTML = 'Trace';

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
    D3TimeseriesView({
      el: _this.el.appendChild(document.createElement('div')),
      data: _timeseries,
      xAxisLabel: 'Time (UTC)',
      yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)'
    }).render();
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesView;
