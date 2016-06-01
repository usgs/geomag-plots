'use strict';


var Collection = require('mvc/Collection'),
    Util = require('util/Util'),
    View = require('mvc/View'),

    TimeseriesView = require('plots/TimeseriesView');


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

      _onTimeseriesAdd,
      _onTimeseriesReset,
      _onTimeseriesRemove;

  _this = View(options);

  _initialize = function (options) {
    if (_this.el.nodeName.toUpperCase() === 'OL' ||
        _this.el.nodeName.toUpperCase() === 'UL') {
      _list = _this.el;
    } else {
      _list = _this.el.appendChild(document.createElement('ol'));
    }
    _list.classList.add('timeseries-collection-list');
    _list.classList.add('no-style');

    _views = Collection([]);

    _collection = options.collection;
    _collection.on('add', _onTimeseriesAdd);
    _collection.on('remove', _onTimeseriesRemove);
    _collection.on('reset', _onTimeseriesReset);

    _onTimeseriesReset();

    // svg events seem to break after orientation change, re-render
    window.addEventListener('orientationchange', _onTimeseriesReset);
  };

  /**
   * Add timeseries to the view.
   *
   * @params added {Array<Timeseries>}
   *    The timeseries being added.
   */
  _onTimeseriesAdd = function (added) {
    var height,
        li,
        view,
        width;

    height = 150;
    width = 960;
    if (window.innerWidth < 768) {
      height = 200;
      width = 480;
    }

    added.forEach(function(timeseries) {
      li = _list.appendChild(document.createElement('li'));
      view = TimeseriesView({
        plotModel: _this.model,
        el: li,
        height: height,
        timeseries: timeseries,
        width: width
      });
      view.id = timeseries.id;
      _views.add(view);
    });
  };

  /**
   * Remove timeseries from the view.
   *
   * @params removed {Array<Timeseries>}
   *    The timeseries being removed.
   */
  _onTimeseriesRemove = function (removed) {
    var view;

    removed.forEach(function (timeseries) {
      view = _views.get(timeseries.id);
      _views.remove(view);
      Util.detach(view.el);
      view.destroy();
    });
  };

  /**
   * Remove old views, and replace with new ones.
   */
  _onTimeseriesReset = function () {
    _views.data().forEach(function (view) {
      Util.detach(view.el);
      view.destroy();
    });
    _views.reset([]);

    _onTimeseriesAdd(_collection.data());
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _collection.off('add', _onTimeseriesAdd);
    _collection.off('remove', _onTimeseriesRemove);
    _collection.off('reset', _onTimeseriesReset);
    _collection = null;

    window.removeEventListener('orientationchange', _onTimeseriesReset);

    // destroy child views
    _views.data().forEach(function (view) {
      Util.detach(view.el);
      view.destroy();
    });
    _views.destroy();
    _views = null;

    _list = null;
    _this = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesCollectionView;
