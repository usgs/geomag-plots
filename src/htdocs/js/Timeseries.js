'use strict';

var Model = require('mvc/Model'),
    Util = require('util/Util');


/**
 * Represents a Timeseries of data points
 *
 * @param options {Object}
 * @param options.times {Array<Dates>}
 *        times of data points.
 * @param options.values {Array<Number>}
 *        values of data points.
 *        null values represents data gaps.
 * @param options.metadata {Object}
 *        information about Timeseries.
 */
var Timeseries = function (options) {
  var _this;

  _this = Model(Util.extend({
    times: null,
    values: null,
    metadata: null
  }, options));


  /**
   * Find data gaps.
   *
   * @return {Array<Object>}
   *         objects representing gaps.
   *         object.start {Date}
   *                      time of first null value in gap.
   *         object.end {Date}
   *                    time of last null value in gap.
   */
  _this.getGaps = function () {
    var gaps,
        gapStart,
        gapEnd,
        i,
        times,
        values;

    gaps = [];
    times = _this.get('times');
    values = _this.get('values');
    // Look for null values in data.
    gapStart = null;
    for (i = 0; i < values.length; i++) {
      if (values[i] === null) {
        // Start gap if not already in a gap.
        if (gapStart === null) {
          gapStart = i;
        }
      } else {
        // End of gap if currently in gap.
        if (gapStart !== null) {
          gapEnd = i - 1;
          gaps.push({
            start: times[gapStart],
            end: times[gapEnd]
          });
          gapStart = null;
        }
      }
    }
    if (gapStart !== null) {
      // end is a gap
      gaps.push({
        start: times[gapStart],
        end: times[times.length - 1]
      });
    }
    return gaps;
  };

  options = null;
  return _this;
};

module.exports = Timeseries;
