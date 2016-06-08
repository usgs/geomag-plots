'use strict';


var Collection = require('mvc/Collection'),
    CompactSelectView = require('plots/CompactSelectView'),
    Formatter = require('util/Formatter'),
    ScaleView = require('plots/ScaleView'),
    Util = require('util/Util'),
    View = require('mvc/View');


var DEFAULTS = {
  channels: [
    'H',
    'E',
    'Z',
    'F'
  ],
  observatories: null
};


/**
 * Choose timeseries to be displayed.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.channels {Array<String>}
 *        default ['H', 'E', 'Z', 'F'].
 *        channel names.
 * @param options.config {Model}.
 *        configuration model to update.
 * @param options.observatories {Array<String>}
 *        default array of 14 observatories.
 *        observatory codes.
 */
var TimeseriesSelectView = function (options) {
  var _this,
      _initialize,
      // variables
      _autoUpdateTimeout,
      _config,
      _elements,
      _elementsEl,
      _elementsView,
      _endTime,
      _endTimeError,
      _endTimeErrorLabel,
      _observatories,
      _observatoriesEl,
      _observatoriesView,
      _onElementSelect,
      _onObservatorySelect,
      _scaleView,
      _startTime,
      _startTimeError,
      _startTimeErrorLabel,
      _timeCustom,
      _timeEl,
      _timeError,
      _timeNext,
      _timePrevious,
      _timePastday,
      _timeRealtime,
      // methods
      _onModeChanged,
      _onTimeChange,
      _onTimeIncrement;


  _this = View(options);

  _initialize = function (options) {
    var el;

    options = Util.extend({}, DEFAULTS, options);
    _config = options.config;
    _elements = options.elements || Collection();

    _observatories = options.observatories || Collection();
    _this.plotModel = options.plotModel;
    _autoUpdateTimeout = null;

    el = _this.el;
    el.classList.add('timeseries-selectview');
    el.innerHTML =
        '<div class="timeseries-elements"></div>' +
        '<div class="timeseries-observatories"></div>' +
        '<h3>Time</h3>' +
        '<div class="timeseries-time">' +
          '<input type="radio" name="timemode" id="time-realtime" ' +
            'value="realtime" />' +
          '<label for="time-realtime">Realtime</label>' +
          '<input type="radio" name="timemode" id="time-pastday" ' +
            'value="pastday" />' +
          '<label for="time-pastday">Past 24 Hours</label>' +
          '<input type="radio" name="timemode" id="time-custom" ' +
            'value="custom" />' +
          '<label for="time-custom">Custom</label>' +
          '<div class="time-input">' +
            '<div class="time-error">' +
            '</div>' +
            '<label class="starttime-error-label" for="time-starttime">' +
              'Start Time (UTC)' +
              '<input type="text" id="time-starttime" name="time-starttime" ' +
                'aria-describedby="starttime-error-message" />' +
            '</label>' +
            '<label class="endtime-error-label" for="time-endtime">' +
              'End Time (UTC)' +
              '<input type="text" id="time-endtime" name="time-endtime"/>' +
            '</label>' +
          '</div>' +
          '<div class="timeseries-increment button-group">' +
            '<button class="previous-button">' +
              'Step Back' +
            '</button>' +
            '<button class="next-button">' +
              'Step Forward' +
            '</button>' +
          '</div>' +
          '<div class="scale-view"></div>' +
        '</div>';

    _elementsEl = el.querySelector('.timeseries-elements');

    _endTime = el.querySelector('#time-endtime');
    _endTimeError = document.createElement('span');
    _endTimeError.classList.add('usa-input-error-message');
    _endTimeErrorLabel = el.querySelector('.endtime-error-label');

    _observatoriesEl = el.querySelector('.timeseries-observatories');

    _timeEl = el.querySelector('.timeseries-time');
    _timeRealtime = el.querySelector('#time-realtime');
    _timePastday = el.querySelector('#time-pastday');
    _timeCustom = el.querySelector('#time-custom');

    _timeNext = el.querySelector('.next-button');
    _timePrevious = el.querySelector('.previous-button');

    _startTime = el.querySelector('#time-starttime');
    _startTimeError = document.createElement('span');
    _startTimeError.classList.add('usa-input-error-message');
    _startTimeErrorLabel = el.querySelector('.starttime-error-label');
    _timeError = el.querySelector('.time-input > .time-error');

    _config.on('change', _this.render);
    _elements.on('select', _onElementSelect);
    _observatories.on('select', _onObservatorySelect);

    _timeRealtime.addEventListener('change', _onModeChanged);
    _timePastday.addEventListener('change', _onModeChanged);
    _timeCustom.addEventListener('change', _onModeChanged);

    _timePrevious.addEventListener('click', _onTimeIncrement);
    _timeNext.addEventListener('click', _onTimeIncrement);

    _startTime.addEventListener('change', _onTimeChange);
    _endTime.addEventListener('change', _onTimeChange);


    _elementsView = CompactSelectView({
      collection: _elements,
      el: _elementsEl,
      title: 'Channel'
    });

    _observatoriesView = CompactSelectView({
      collection: _observatories,
      el: _observatoriesEl,
      title: 'Observatory'
    });

    _scaleView = ScaleView({
      el: _this.el.querySelector('.scale-view'),
      model: _this.plotModel
    });

    // initial render
    _this.render();
  };

  /**
   * Calls _this.onElementSelect()
   */
  _onElementSelect = function () {
    _this.onElementSelect();
  };

  /**
   * Calls public function onObservatorySelect
   */
  _onObservatorySelect = function () {
    _this.onObservatorySelect();
  };

  /**
   * Handles radio button changes for time mode.
   *
   * Note Custom doesn't actually cause a reset, it just turns off auto update.
   */
  _onModeChanged = function (e) {
    if (e.target === _timeRealtime) {
      _this.setRealtime();
    } else if (e.target === _timePastday) {
      _this.setPastDay();
    } else if (e.target === _timeCustom) {
      _this.clearAutoUpdateTimeout();
    }
  };

  /**
   * Time text input change handler.
   */
  _onTimeChange = function () {
    if (!_timeCustom.checked) {
      _timeCustom.checked = true;
    }
    _this.onTimeChange();
  };

  /**
   * Event handler for when time is incremented.
   */
  _onTimeIncrement = function (e) {
    _this.onTimeIncrement(e);
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _this.clearAutoUpdateTimeout();
    _elementsView.destroy();
    _scaleView.destroy();
    _observatoriesView.destroy();

    _config.off('change', _this.render);
    _elements.off('select', _onElementSelect);
    _observatories.off('select', _onObservatorySelect);

    _timeRealtime.removeEventListener('change', _onModeChanged);
    _timePastday.removeEventListener('change', _onModeChanged);
    _timeCustom.removeEventListener('change', _onModeChanged);

    _timePrevious.removeEventListener('click', _onTimeIncrement);
    _timeNext.removeEventListener('click', _onTimeIncrement);

    _startTime.removeEventListener('change', _onTimeChange);
    _endTime.removeEventListener('change', _onTimeChange);

    // variables
    _config = null;
    _elements = null;
    _elementsEl = null;
    _elementsView = null;
    _endTime = null;
    _endTimeError = null;
    _endTimeErrorLabel = null;
    _observatories = null;
    _observatoriesEl = null;
    _observatoriesView = null;
    _onElementSelect = null;
    _onObservatorySelect = null;
    _scaleView = null;
    _startTime = null;
    _startTimeError = null;
    _startTimeErrorLabel = null;
    _timeCustom = null;
    _timeEl = null;
    _timeError = null;
    _timeNext = null;
    _timePrevious = null;
    _timePastday = null;
    _timeRealtime = null;

    // methods
    _onTimeChange = null;
    _onTimeIncrement = null;

    _this = null;
  }, _this.destroy);

  /**
   * Clear Auto Update Timeout
   */
  _this.clearAutoUpdateTimeout = function () {
    if (_autoUpdateTimeout !== null) {
      clearTimeout(_autoUpdateTimeout);
      _autoUpdateTimeout = null;
    }
  };

  /**
   * Maintains the relationship between "elements" and "observatories" when
   * an item is selected in the "element" collection.
   *
   * Sets the config model with the selected "element" id, and removes any
   * selected "observatories".
   */
  _this.onElementSelect = function () {
    if (_observatories.getSelected()) {
      _observatories.deselect();
    }

    // This set will trigger the render
    _config.set({
      'observatories': _observatories.data().map(function (o) { return o.id; }),
      'elements': [_elements.getSelected().id]
    });
  };

  /**
   * Maintains the relationship between "elements" and "observatories" when
   * an item is selected in the "observatory" collection.
   *
   * Sets the config model with the selected "observatory" id, and removes any
   * selected "observatories".
   */
  _this.onObservatorySelect = function () {
    // only set to null if, not already null
    if (_elements.getSelected()) {
      _elements.deselect();
    }

    // This set will trigger the render
    _config.set({
      'elements': _elements.data().map(function (e) { return e.id; }),
      'observatories': [_observatories.getSelected().id]
    });
  };

  /**
   * Event Handler for previous/next clicks.
   *
   * @params e (Event)
   *    The event which called onTimeIncrement.
   *    Used to determine whether to increment or decrement the time.
   *
   * @Notes
   *    Time values are incremented/decremented by 1/2 the current time range.
   */
  _this.onTimeIncrement = function (e) {
    var direction,
        endtime,
        increment,
        starttime,
        timemode;

    endtime = _config.get('endtime');
    starttime = _config.get('starttime');
    timemode = _config.get('timemode');

    _this.clearAutoUpdateTimeout();

    if (!_timeCustom.checked) {
      _timeCustom.checked = true;
    }

    if (e.target === _timeNext) {
      direction = 1;
    } else {
      direction = -1;
    }

    increment = direction * ((endtime.getTime() - starttime.getTime()) / 2);

    starttime = new Date(starttime.getTime() + increment);
    endtime = new Date(endtime.getTime() + increment);

    _config.set({
      timemode: 'custom',
      starttime: starttime,
      endtime: endtime
    });
  };

  /**
   * Handles changes in time(s) inputs.
   */
  _this.onTimeChange = function () {
    var endtime,
        starttime;

    _this.clearAutoUpdateTimeout();

    if (_timeCustom.checked) {
      endtime = _this.parseDate(_endTime.value);
      starttime = _this.parseDate(_startTime.value);

      if (_this.validateStartTime(starttime) &&
          _this.validateEndTime(endtime) &&
          _this.timeOrder(starttime, endtime) &&
          _this.validateRange(starttime, endtime)){
        _config.set({
          endtime: endtime,
          starttime: starttime,
          timemode: 'custom'
        });
      }
    }
  };

  /**
   * Parse a date string.
   *
   * @param s {String}
   *        ISO8601ish string to parse as UTC.
   * @return {Date}
   *         parsed date, or null if unable to parse.
   */
  _this.parseDate = function (s) {
    var dt;

    if (!s) {
      return null;
    }
    dt = new Date(s.replace(' ', 'T').replace('Z', '') + 'Z');
    return dt;
  };

  /**
   * Set the config time to the past day.
   */
  _this.setPastDay = function() {
    var endtime,
        starttime;

    _this.clearAutoUpdateTimeout();

    endtime = _this.roundUpToNearestNMinutes(new Date(), 5);
    starttime = new Date(endtime.getTime() - 86400000);

    _config.set({
      endtime: endtime,
      starttime: starttime,
      timemode: 'pastday'
    });

    _autoUpdateTimeout = setTimeout(_this.setPastDay, 30000);
  };

    /**
   * Update controls based on current model.
   */
  _this.render = function () {
    var endTime,
        now,
        startTime,
        timeMode;

    endTime = _config.get('endtime');
    startTime = _config.get('starttime');
    timeMode = _config.get('timemode');

    _endTime.value = Formatter.formatDate(endTime);
    _startTime.value = Formatter.formatDate(startTime);
    if (timeMode === 'realtime') {
      _timeRealtime.checked = true;
      _timeNext.disabled = true;
    } else if (timeMode === 'pastday') {
      _timePastday.checked = true;
      _timeNext.disabled = true;
    } else {
      _timeCustom.checked = true;
      now = new Date();
      if (endTime > now) {
        _timeNext.disabled = true;
      } else {
        _timeNext.disabled = false;
      }
    }
  };

  /**
   * Round a date up to the next N minute interval.
   *
   * @param dt {Date}
   *        date to round.
   * @param n {Integer}
   *        default 5.
   *        number of minutes to round to.
   *        e.g. 1: round up to nearest minute.
   *             5: round up to nearest 5 minutes.
   * @return {Date} rounded date.
   *         If dt is on a 5 minute interval, the return value is 5 minutes later.
   */
  _this.roundUpToNearestNMinutes = function (dt, n) {
    var y,
        m,
        d,
        h,
        i;

    y = dt.getUTCFullYear();
    m = dt.getUTCMonth();
    d = dt.getUTCDate();
    h = dt.getUTCHours();
    i = dt.getUTCMinutes();

    n = n || 5;
    // round i
    i = n * Math.floor((i + n) / n);
    return new Date(Date.UTC(y, m, d, h, i));
  };


  /**
   * Sets the config time to "Realtime"
   *
   * Realtime is defined as the current 15 minutes.
   */
  _this.setRealtime= function() {
    var endtime,
        starttime;

    _this.clearAutoUpdateTimeout();

    endtime = _this.roundUpToNearestNMinutes(new Date(), 1);
    starttime = new Date(endtime.getTime() - 900000);

    _config.set({
      endtime: endtime,
      starttime: starttime,
      timemode: 'realtime'
    });

    _autoUpdateTimeout = setTimeout(_this.setRealtime, 30000);
  };

  /**
   * Show/clear error message for time inputs.
   *
   * @param message {String}
   *        error message, or null if no errors.
   */
  _this.setTimeError = function (message) {
    if (message === null) {
      _timeError.innerHTML = '';
      _timeError.classList.remove('error');
      _timeError.classList.remove('alert');
    } else {
      _timeError.innerHTML = message;
      _timeError.classList.add('alert');
      _timeError.classList.add('error');
    }
  };

  /**
   * Ensure that start time comes before end time. Swap them if needed.
   * If start and end are identical (within 10 seconds), make the range
   * between them 3 days.
   *
   * @param start {Date}
   *        time entered in start field.
   * @param end {Date}
   *        time entered in end field.
   * @return [{Date}, {Date}]
   *         start time and end time in proper order.
   */
  _this.timeOrder = function(start, end) {
    if (start > end) {
      _this.setTimeError('Start Time must come before End Time.');
      return false;
    } else {
      _this.setTimeError(null);
      return true;
    }
  };

  /**
   * Validate a date-time string, or create a valid date-time.
   *
   * @param time {Date}
   *        string that needs to be a valid date-time.
   * @return {Boolean}
   *         true if time is a valid date time.
   */
  _this.validateEndTime = function (time) {
    if (time === null || !(time instanceof Date) || isNaN(+time)) {
      _endTimeError.innerHTML = 'Please enter a valid time.';
      _endTimeErrorLabel.classList.add('usa-input-error-label');
      _endTimeErrorLabel.insertBefore(_endTimeError, _endTime);
      return false;
    } else {
      var span;

      _endTimeError.innerHTML = '';
      _endTimeErrorLabel.classList.remove('usa-input-error-label');

      span = _endTimeErrorLabel.querySelector('.usa-input-error-message');
      if (span !== null) {
        _endTimeErrorLabel.removeChild(span);
      }

      return true;
    }
  };

  /**
   * Validate a date-time string, or create a valid date-time.
   *
   * @param time {Date}
   *        string that needs to be a valid date-time.
   * @return {Boolean}
   *         true if time is a valid date time.
   */
  _this.validateStartTime = function (time) {
    if (time === null || !(time instanceof Date) || isNaN(+time)) {
      _startTimeError.innerHTML = 'Please enter a valid time.';
      _startTimeErrorLabel.classList.add('usa-input-error-label');
      _startTimeErrorLabel.insertBefore(_startTimeError, _startTime);
      return false;
    } else {
      var span;

      _startTimeError.innerHTML = '';
      _startTimeErrorLabel.classList.remove('usa-input-error-label');

      span = _startTimeErrorLabel.querySelector('.usa-input-error-message');
      if (span !== null) {
        _startTimeErrorLabel.removeChild(span);
      }

      return true;
    }
  };

  /**
   * Ensure that the time range isn't greater than 1 month.
   *
   * @param start {Date}
   *        time entered in start field.
   * @param end {Date}
   *        time entered in end field.
   * @return {Boolean}
   *         true if the range is less than 31 days.
   */
  _this.validateRange = function (start, end) {
    if ((end-start) > 2678400000) {
      _this.setTimeError('Please select less than 1 month of data.');
      return false;
    } else {
      _this.setTimeError(null);
      return true;
    }
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesSelectView;
