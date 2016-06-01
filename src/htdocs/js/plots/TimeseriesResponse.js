'use strict';


var Model = require('mvc/Model'),
    Timeseries = require('plots/Timeseries');


var _ID_SEQUENCE = 0;


/**
 * Wrapper for Timeseries webservice response.
 *
 * @param options {Object}
 *        All options are passed to Model.
 */
var TimeseriesResponse = function (options) {
  var _this;


  _this = Model(options);

  /**
   * Get Timeseries objects.
   *
   * @return {Array<Timeseries>}
   *         All of the Timeseries objects in this response
   */
  _this.getTimeseries = function () {
    var times,
        timeseries;

    timeseries = [];

    times = _this.get('times').map(function (t) {
      return new Date(Date.parse(t));
    });

    _this.get('values').forEach(function (channel) {
      var metadata;

      metadata = channel.metadata;

      timeseries.push(
        Timeseries({
          id: _ID_SEQUENCE++,
          times: times,
          values: channel.values,
          metadata: {
            observatory: metadata.station,
            channel: metadata.element
          }
        })
      );
    });

    return timeseries;
  };

  options = null;
  return _this;
};


module.exports = TimeseriesResponse;
