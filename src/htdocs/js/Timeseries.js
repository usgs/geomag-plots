'use strict';

var Model = require('mvc/Model'),
    Util = require('util/Util');

var Timeseries = function (options) {
  var _this;

  _this = Model(Util.extend({
    times: null,
    values: null,
    metadata: null
  }, options));

/* Loops over values looking for null values in data. If a null value is found
 * the index for the first and last null value is saved and used to find the
 * start and end times. The times are pushed to the gaps array
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

    gapStart = null;
    for (i = 0; i < values.length; i++) {
      if (values[i] === null) {
        if (gapStart === null) {
          gapStart = i;
        }
      } else {
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
    return gaps;
  };

  options = null;
  return _this;
};

module.exports = Timeseries;
