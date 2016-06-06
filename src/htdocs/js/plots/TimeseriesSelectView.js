'use strict';

var Collection = require('mvc/Collection'),
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
      _channels,
      _channelEl,
      _config,
      _endTime,
      _endTimeError,
      _endTimeErrorLabel,
      _observatories,
      _observatoryEl,
      _scaleView,
      _startTime,
      _startTimeError,
      _startTimeErrorLabel,
      _timeCustom,
      _timeEl,
      _timeError,
      _timePastday,
      _timeRealtime,
      _timeUpdate,
      // methods
      _formatDate,
      _onChannelClick,
      _onObservatoryClick,
      _onTimeChange,
      _parseDate,
      _setTimeError,
      _timeOrder,
      _validateRange,
      _validateEndTime,
      _validateStartTime;

  _this = View(options);


  _initialize = function (options) {
    var el;

    options = Util.extend({}, DEFAULTS, options);
    _channels = options.channels;
    _config = options.config;
    _observatories = options.observatories || Collection();
    _this.plotModel = options.plotModel;

    el = _this.el;
    el.classList.add('timeseries-selectview');
    el.innerHTML =
        '<h2>Channel</h2>' +
        '<div class="timeseries-channel"></div>' +
        '<h2>Observatory</h2>' +
        '<div class="timeseries-observatory"></div>' +
        '<h2>Time</h2>' +
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
            '<button>Update</button>' +
          '</div>' +
          '<div class="scale-view"></div>' +
        '</div>';

    _channelEl = el.querySelector('.timeseries-channel');
    _endTime = el.querySelector('#time-endtime');
    _endTimeError = document.createElement('span');
    _endTimeError.classList.add('usa-input-error-message');
    _endTimeErrorLabel = el.querySelector('.endtime-error-label');
    _observatoryEl = el.querySelector('.timeseries-observatory');
    _timeEl = el.querySelector('.timeseries-time');
    _timeRealtime = el.querySelector('#time-realtime');
    _timePastday = el.querySelector('#time-pastday');
    _timeCustom = el.querySelector('#time-custom');
    _startTime = el.querySelector('#time-starttime');
    _startTimeError = document.createElement('span');
    _startTimeError.classList.add('usa-input-error-message');
    _startTimeErrorLabel = el.querySelector('.starttime-error-label');
    _timeUpdate = el.querySelector('.time-input > button');
    _timeError = el.querySelector('.time-input > .time-error');

    _config.on('change', _this.render);
    _observatories.on('reset', _this.render);

    _channelEl.addEventListener('click', _onChannelClick);
    _observatoryEl.addEventListener('click', _onObservatoryClick);
    _timeRealtime.addEventListener('change', _onTimeChange);
    _timePastday.addEventListener('change', _onTimeChange);
    _timeCustom.addEventListener('change', _onTimeChange);
    _startTime.addEventListener('change', _onTimeChange);
    _endTime.addEventListener('change', _onTimeChange);
    _timeUpdate.addEventListener('click', _onTimeChange);
    _scaleView = ScaleView({
      el: _this.el.querySelector('.scale-view'),
      model: _this.plotModel
    });

    // initial render
    _this.render();
  };

  /**
   * Format a date object.
   *
   * @param d {Date}
   *        date to format.
   */
  _formatDate = function (d) {
    if (!d || typeof d.toISOString !== 'function') {
      return '';
    }
    return d.toISOString().replace('T', ' ').replace(/\.[\d]{3}Z/, '');
  };

  /**
   * Channel element delegated click handler.
   */
  _onChannelClick = function (e) {
    var id = e.target.getAttribute('data-id');
    e.preventDefault();
    if (id) {
      _config.set({
        channel: id,
        observatory: null
      });
    }
  };

  /**
   * Observatory element delegated click handler.
   */
  _onObservatoryClick = function (e) {
    var id = e.target.getAttribute('data-id');
    e.preventDefault();
    if (id) {
      _config.set({
        channel: null,
        observatory: id
      });
    }
  };

  /**
   * Time radio and text input change handler.
   */
  _onTimeChange = function (e) {
    var endTime,
        startTime;

    if (_timeCustom.checked) {
      _timeEl.classList.add('custom');
      if (e.target === _timeCustom) {
        // user selected custom, allow to edit times
        return;
      }

      endTime = _parseDate(_endTime.value);
      startTime = _parseDate(_startTime.value);

      if (_validateStartTime(startTime) &&
          _validateEndTime(endTime) &&
          _timeOrder(startTime, endTime) &&
          _validateRange(startTime, endTime)){
        _config.set({
          endtime: endTime,
          starttime: startTime,
          timemode: 'custom'
        });
      }
    } else {
      _timeEl.classList.remove('custom');
      if (_timeRealtime.checked) {
        _config.set({
          timemode: 'realtime'
        });
      } else if (_timePastday.checked) {
        _config.set({
          timemode: 'pastday'
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
  _parseDate = function (s) {
    var dt;
    if (!s) {
      return null;
    }
    dt = new Date(s.replace(' ', 'T').replace('Z', '') + 'Z');
    return dt;
  };

  /**
   * Show/clear error message for time inputs.
   *
   * @param message {String}
   *        error message, or null if no errors.
   */
  _setTimeError = function (message) {
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
  _timeOrder = function(start, end) {
    if (start > end) {
      _setTimeError('Start Time must come before End Time.');
      return false;
    } else {
      _setTimeError(null);
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
  _validateEndTime = function (time) {
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
  _validateStartTime = function (time) {
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
  _validateRange = function (start, end) {
    if ((end-start) > 2678400000) {
      _setTimeError('Please select less than 1 month of data.');
      return false;
    } else {
      _setTimeError(null);
      return true;
    }
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _scaleView.destroy();

    _config.off('change', _this.render);
    _observatories.off('reset', _this.render);

    _channelEl.removeEventListener('click', _onChannelClick);
    _observatoryEl.removeEventListener('click', _onObservatoryClick);
    _timeRealtime.removeEventListener('change', _onTimeChange);
    _timePastday.removeEventListener('change', _onTimeChange);
    _timeCustom.removeEventListener('change', _onTimeChange);
    _startTime.removeEventListener('change', _onTimeChange);
    _endTime.removeEventListener('change', _onTimeChange);
    _timeUpdate.removeEventListener('click', _onTimeChange);


    // variables
    _channels = null;
    _channelEl = null;
    _config = null;
    _endTime = null;
    _endTimeError = null;
    _endTimeErrorLabel = null;
    _observatories = null;
    _observatoryEl = null;
    _scaleView = null;
    _startTime = null;
    _startTimeError = null;
    _startTimeErrorLabel = null;
    _timeCustom = null;
    _timeEl = null;
    _timeError = null;
    _timePastday = null;
    _timeRealtime = null;
    _timeUpdate = null;
    _validateEndTime = null;
    _validateStartTime = null;

    // methods
    _formatDate = null;
    _onChannelClick = null;
    _onObservatoryClick = null;
    _onTimeChange = null;
    _parseDate = null;
    _setTimeError = null;
    _timeOrder = null;
    _validateRange = null;
    _validateEndTime = null;
    _validateStartTime = null;

    _this = null;
  }, _this.destroy);

  /**
   * Update controls based on current model.
   */
  _this.render = function () {
    var endTime = _config.get('endtime'),
        selectedChannel = _config.get('channel'),
        selectedObservatory = _config.get('observatory'),
        startTime = _config.get('starttime'),
        timeMode = _config.get('timemode');

    _channelEl.innerHTML = _channels.map(function (channel) {
      return '<a href="#" data-id="' + channel + '"' +
          (channel === selectedChannel ?
              ' class="selected"' : '') +
          '>' + channel + '</a>';
    }).join('');

    _observatoryEl.innerHTML = Object.keys(_observatories.getIds()).
        map(function (observatory) {
          return '<a href="#" data-id="' + observatory + '"' +
              (observatory === selectedObservatory ?
                  ' class="selected"' : '') +
              '>' + observatory + '</a>';
        }).join('');

    _endTime.value = _formatDate(endTime);
    _startTime.value = _formatDate(startTime);
    if (timeMode === 'realtime') {
      _timeRealtime.checked = true;
    } else if (timeMode === 'pastday') {
      _timePastday.checked = true;
    } else {
      _timeCustom.checked = true;
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TimeseriesSelectView;
