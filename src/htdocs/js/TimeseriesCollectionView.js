'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),

    D3TimeseriesView = require('D3TimeseriesView');


/**
 * Display a timeseries collection.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.collection {Collection<Timeseries>}.
 *        timeseries to display.
 */
var TimeseriesCollectionView = function (options) {
  var _this,
      _initialize,
      _collection;

  _this = View(options);

  _initialize = function (options) {
    _this.el.innerHTML = '<p>I am a TimeseriesCollectionView</p>';

    _collection = options.collection;
    // TODO: bind to other collection events.
    _collection.on('reset', _this.render);
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _collection.off('reset', _this.render);
    _collection = null;
    _this = null;
  }, _this.destroy);

  _this.render = function () {
    // TODO: clean this up
    _this.el.innerHTML = '';
    _collection.data().forEach(function (timeseries) {
      var meta = timeseries.get('metadata');
      D3TimeseriesView({
        el: _this.el.appendChild(document.createElement('div')),
        data: timeseries,
        xAxisLabel: 'Time (UTC)',
        yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)'
      }).render();
    });
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesCollectionView;
