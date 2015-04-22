'use strict';

var Util = require('util/Util'),
    View = require('mvc/View');


var DEFAULTS = {
  channels: [
    'H',
    'E',
    'Z',
    'F'
  ],
  observatories: [
    'BOU',
    'BRW',
    'BSL',
    'CMO',
    'DED',
    'FRD',
    'FRN',
    'GUA',
    'HON',
    'NEW',
    'SHU',
    'SIT',
    'SJG',
    'TUC'
  ]
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
      _observatories,
      _observatoryEl,
      _startTime,
      _timeCustom,
      _timeEl,
      _timePastday,
      _timePasthour,
      _timeRealtime,
      _timeUpdate,
      // methods
      _formatDate,
      _onChannelClick,
      _onObservatoryClick,
      _onTimeChange,
      _parseDate;

  _this = View(options);

  _initialize = function (options) {
    var el;

    options = Util.extend({}, DEFAULTS, options);
    _channels = options.channels;
    _config = options.config;
    _observatories = options.observatories;

    el = _this.el;
    el.classList.add('timeseries-selectview');
    el.innerHTML =
        '<h2>Channel</h2>' +
        '<div class="channel"></div>' +
        '<h2>Observatory</h2>' +
        '<div class="observatory"></div>' +
        '<h2>Time</h2>' +
        '<div class="time vertical">' +
          '<label for="time-realtime">' +
            '<input type="radio" name="timemode" id="time-realtime"/>' +
            'Realtime' +
          '</label>' +
          '<label for="time-pasthour">' +
            '<input type="radio" name="timemode" id="time-pasthour"/>' +
            'Past Hour' +
          '</label>' +
          '<label for="time-pastday">' +
            '<input type="radio" name="timemode" id="time-pastday"/>' +
            'Past Day' +
          '</label>' +
          '<label for="time-custom">' +
            '<input type="radio" name="timemode" id="time-custom"/>' +
            'Custom' +
          '</label>' +
          '<div class="time-input">' +
            '<label for="time-starttime">Start Time (UTC)</label>' +
            '<input type="text" id="time-starttime"/>' +
            '<label for="time-endtime">End Time (UTC)</label>' +
            '<input type="text" id="time-endtime"/>' +
            '<button>Update</button>' +
          '</div>' +
        '</div>';

    _channelEl = el.querySelector('.channel');
    _observatoryEl = el.querySelector('.observatory');
    _timeEl = el.querySelector('.time');
    _timeRealtime = el.querySelector('#time-realtime');
    _timePasthour = el.querySelector('#time-pasthour');
    _timePastday = el.querySelector('#time-pastday');
    _timeCustom = el.querySelector('#time-custom');
    _startTime = el.querySelector('#time-starttime');
    _endTime = el.querySelector('#time-endtime');
    _timeUpdate = el.querySelector('.time-input > button');

    _config.on('change', _this.render);
    _channelEl.addEventListener('click', _onChannelClick);
    _observatoryEl.addEventListener('click', _onObservatoryClick);
    _timeRealtime.addEventListener('change', _onTimeChange);
    _timePasthour.addEventListener('change', _onTimeChange);
    _timePastday.addEventListener('change', _onTimeChange);
    _timeCustom.addEventListener('change', _onTimeChange);
    _startTime.addEventListener('change', _onTimeChange);
    _endTime.addEventListener('change', _onTimeChange);
    _timeUpdate.addEventListener('click', _onTimeChange);

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
      // TODO: validate input
      endTime = _parseDate(_endTime.value);
      startTime = _parseDate(_startTime.value);
      if (endTime !== null && startTime !== null) {
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
      } else if (_timePasthour.checked) {
        _config.set({
          timemode: 'pasthour'
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
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    _config.off('change', _this.render);
    _channelEl.removeEventListener('click', _onChannelClick);
    _observatoryEl.removeEventListener('click', _onObservatoryClick);
    _timeRealtime.removeEventListener('change', _onTimeChange);
    _timePasthour.removeEventListener('change', _onTimeChange);
    _timePastday.removeEventListener('change', _onTimeChange);
    _timeCustom.removeEventListener('change', _onTimeChange);
    _startTime.removeEventListener('change', _onTimeChange);
    _endTime.removeEventListener('change', _onTimeChange);
    _timeUpdate.removeEventListener('click', _onTimeChange);

    _config = null;
    _channelEl = null;
    _observatoryEl = null;
    _timeRealtime = null;
    _timePasthour = null;
    _timePastday = null;
    _timeCustom = null;
    _startTime = null;
    _endTime = null;
    _timeUpdate = null;

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

    _observatoryEl.innerHTML = _observatories.map(function (observatory) {
      return '<a href="#" data-id="' + observatory + '"' +
          (observatory === selectedObservatory ?
              ' class="selected"' : '') +
          '>' + observatory + '</a>';
    }).join('');

    _endTime.value = _formatDate(endTime);
    _startTime.value = _formatDate(startTime);
    if (timeMode === 'realtime') {
      _timeRealtime.checked = true;
    } else if (timeMode === 'pasthour') {
      _timePasthour.checked = true;
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
