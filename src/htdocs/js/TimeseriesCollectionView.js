'use strict';

var Collection = require('mvc/Collection'),
    Util = require('util/Util'),
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

      _collection,
      _list,
      _views,

      _createView,
      _onTimeseriesReset,
      _onTimeseriesRemove,

      _tempView; //TODO delete when TimeseriesView is ready.

  _this = View(options);

  _initialize = function (options) {
    if (_this.el.nodeName.toUpperCase() === 'OL' ||
        _this.el.nodeName.toUpperCase() === 'UL') {
      _list = _this.el;
    } else {
      _list = _this.el.appendChild(document.createElement('ol'));
    }
    _list.classList.add('analysis-collection-list');
    _list.classList.add('no-style');

    _views = Collection([]);


    _collection = options.collection;
    // TODO: bind to other collection events.
    _collection.on('remove', _this._onTimeseriesRemove);
    _collection.on('reset', _this._onTimeseriesReset);

    _onTimeseriesReset();
  };

  _createView = function (timeseries) {
    var li,
        view;

    li = document.createElement('li');
    li.classList.add('timeseries-view');
    view = _tempView({timeseries:timeseries, el:li});

    return view;
  };

  _tempView = function (options) {
    var el = options.el,
        timeseries = options.timeseries,
        meta = timeseries.get('metadata'),
        view;

    view = D3TimeseriesView({
      el: el.appendChild(document.createElement('div')),
      data: timeseries,
      xAxisLabel: 'Time (UTC)',
      yAxisLabel: meta.observatory + ' ' + meta.channel + ' (nT)'
    });

    view.render();

    return view;
  };

  _onTimeseriesRemove = function (timeseriesCollection) {
    timeseriesCollection.forEach(function (timeseries) {
      _views.
    });
  };

  _onTimeseriesReset = function () {
    _views.data().forEach(function (view) {
      _views.remove(view);
      view.destroy();
    });

    _collection.getTimeseries().forEach(function (timeseries) {
      _views.add(_createView(timeseries));
    });

    _this.render();
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
    _views.data().forEach(function (view) {
      _list.appendChild(view.el);
    });
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesCollectionView;
