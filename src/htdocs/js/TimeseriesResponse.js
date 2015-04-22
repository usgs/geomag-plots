'use strict';

var Model = require('mvc/Model'),
    Timeseries = require('Timeseries');

var ID_SEQUENCE = 0;


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
        timeseries = [];

    times = _this.get('times').map(function (t) {
      return new Date(t*1000);
    });

    _this.get('data').forEach(function (obs) {
      var channel;

      for (channel in obs.values) {
        timeseries.push(
          Timeseries({
            id: ID_SEQUENCE++,
            times: times,
            values: obs.values[channel],
            metadata: {
              observatory: obs.id,
              channel: channel,
              nominal: obs.nominals[channel]
            }
          })
        );
      }
    });

    return timeseries;
  };

  options = null;
  return _this;
};


module.exports = TimeseriesResponse;
