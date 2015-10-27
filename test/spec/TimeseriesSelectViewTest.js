/* global afterEach, beforeEach, chai, describe, it */
'use strict';

var expect = chai.expect,

    Model = require('mvc/Model'),
    Util = require('util/Util'),

    TimeseriesSelectView = require('TimeseriesSelectView');


var _fireClickEvent = function (target) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initMouseEvent('click', true, true, window, 1, 0, 0);
  target.dispatchEvent(clickEvent);
};


describe('TimeSeriesSelectView', function () {

  describe('class', function () {
    it('is defined', function () {
      expect(TimeseriesSelectView).to.not.equal(null);
    });

    it('can be destroyed', function () {
      var view = TimeseriesSelectView({config: Model()});
      view.destroy();
    });
  });

  describe('render()', function () {
    var config,
        view;

    config = Model({
      observatory: 'HON',
      channel: 'E',
      timemode: 'realtime'
    });

    view = TimeseriesSelectView({
      config: config
    });

    it('selects observatory', function () {
      var selected = view.el.querySelector('.timeseries-observatory .selected');
      expect(selected.getAttribute('data-id')).to.equal('HON');
    });

    it('selects channel', function () {
      var selected = view.el.querySelector('.timeseries-channel .selected');
      expect(selected.getAttribute('data-id')).to.equal('E');
    });

    it('selects correct time radio input', function () {
      expect(view.el.querySelector('#time-realtime').checked).to.equal(true);
    });

  });

  describe('onClick()', function () {
    var config,
        view;

    beforeEach(function () {
      config = Model({
        observatory: 'HON',
        channel: 'E',
        timemode: 'realtime'
      });

      view = TimeseriesSelectView({
        config: config
      });
      document.querySelector('body').appendChild(view.el);
    });

    afterEach(function () {
      Util.detach(view.el);
      view.destroy();
    });

    it('observatory click updates config', function () {
      var observatory = view.el.querySelector('.timeseries-observatory :first-child');
      _fireClickEvent(observatory);
      expect(config.get('observatory')).to.equal(
          observatory.getAttribute('data-id'));
      expect(config.get('channel')).to.equal(null);
    });

    it('channel click updates config', function () {
      var channel = view.el.querySelector('.timeseries-channel :first-child');
      _fireClickEvent(channel);
      expect(config.get('channel')).to.equal(
          channel.getAttribute('data-id'));
      expect(config.get('observatory')).to.equal(null);
    });
  });

  describe('onChange()', function () {
    var config,
        view;

    beforeEach(function () {
      config = Model({
        observatory: 'HON',
        channel: 'E',
        timemode: 'realtime'
      });

      view = TimeseriesSelectView({
        config: config
      });
      document.querySelector('body').appendChild(view.el);
    });

    afterEach(function () {
      Util.detach(view.el);
      view.destroy();
    });

    it('selects correct time radio input', function () {
      var radio;
      // realtime
      radio = view.el.querySelector('#time-realtime');
      _fireClickEvent(radio);
      expect(config.get('timemode')).to.equal('realtime');
      // past day
      radio = view.el.querySelector('#time-pastday');
      _fireClickEvent(radio);
      expect(config.get('timemode')).to.equal('pastday');
      // custom
      radio = view.el.querySelector('#time-custom');
      _fireClickEvent(radio);
      // custom waits for start/end time to be entered
      // phantomjs doesn't handle ISO dates, browsers do
      view.el.querySelector('#time-starttime').value = '2015-01-01 00:00:00';
      view.el.querySelector('#time-endtime').value = '2015-01-02 00:00:00';
      _fireClickEvent(view.el.querySelector('.time-input > button'));
      expect(view.el.querySelector('.time-error').innerHTML).to.equal('');
      expect(config.get('timemode')).to.equal('custom');
    });

  });

});
