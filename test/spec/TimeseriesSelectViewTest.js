/* global afterEach, beforeEach, chai, describe, it */
'use strict';

var expect = chai.expect,

    Collection = require('mvc/Collection'),
    Model = require('mvc/Model'),
    Util = require('util/Util'),

    TimeseriesSelectView = require('plots/TimeseriesSelectView');


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
    it('selects correct time radio input', function () {
      var config,
          view;

      config = Model({
        observatory: 'HON',
        channel: 'E',
        timemode: 'realtime'
      });

      view = TimeseriesSelectView({
        config: config,
        observatories: Collection([
          {id: 'HON'}
        ])
      });

      expect(view.el.querySelector('#time-realtime').checked).to.equal(true);
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
