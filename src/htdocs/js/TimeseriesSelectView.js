'use strict';

var Util = require('util/Util'),
    View = require('mvc/View');


/**
 * Choose timeseries to be displayed.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.config {Collection<Timeseries>}.
 *        configuration model to update.
 */
var TimeseriesSelectView = function (options) {
  var _this,
      _initialize,
      // variables
      _config;

  _this = View(options);

  _initialize = function (options) {
    _this.el.innerHTML = '<p>I am a TimeseriesSelectView</p>';

    _config = options.config;
    _config.on('change', _this.render);

    // initial render
    _this.render();
  };


  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _config.off('change', _this.render);
    _config = null;
    _this = null;
  }, _this.destroy);

  /**
   * Update controls based on current model.
   */
  _this.render = function () {
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesSelectView;
