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
        element: 'E',
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
        element: 'E',
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
      // Radio click doesn't set anything on custom.
      // timemode should be what it was last set to.
      radio = view.el.querySelector('#time-custom');
      _fireClickEvent(radio);
      expect(config.get('timemode')).to.equal('pastday');
    });

  });

  describe('onTimeIncrement', function () {
    it('sets starttime/endtime corretcly', function () {
      var config,
          e,
          endtime,
          starttime,
          view;

      config = Model({
        starttime: new Date('2016-05-03T19:31:00Z'),
        endtime: new Date('2016-05-04T19:31:00Z'),
        timecode: 'pastday'
      });

      view = TimeseriesSelectView({config: config});

      e = {};
      e.target = view.el.querySelector('.previous-button');

      view.onTimeIncrement(e);

      starttime = new Date('2016-05-03T07:31:00Z');
      endtime = new Date('2016-05-04T07:31:00Z');

      expect(config.get('starttime').toString()).to.equal(
          starttime.toString());
    });
  });

  describe('setRealtime', function () {
    it('sets startime and endtime to past day', function () {
      var endtime,
          starttime,
          config,
          view;

      config = Model({
        timemode: 'pastday'
      });
      view = TimeseriesSelectView({config: config});

      view.setRealtime();

      endtime = new Date();
      starttime = new Date(endtime.getTime() - 900000);

      expect(config.get('starttime').getTime()).to.be.closeTo(
          starttime.getTime(), 61000);

      view.destroy();
    });


  });

  describe('setPastDay', function () {
    it('sets startime and endtime to past day', function () {
      var config,
          endtime,
          starttime,
          view;

      config = Model({
        timemode: 'pastday'
      });
      view = TimeseriesSelectView({config: config});

      view.setPastDay();

      endtime = new Date();
      starttime = new Date(endtime.getTime() - 86400000);

      expect(config.get('starttime').getTime()).to.be.closeTo(
          starttime.getTime(), 301000);

      view.destroy();
    });

  });

  describe('onTimeChange', function () {
    var config,
        view;

    beforeEach (function () {
      config = Model({
        timemode: 'pastday'
      });
      view = TimeseriesSelectView({config: config});
    });

    afterEach (function () {
      view.destroy();
    });

    it('sets starttime and endtime to custom time', function () {
      var endtime,
          starttime;

      config.set({
        timemode: 'custom'
      });

      starttime = new Date('2016-05-03T07:31:00Z');
      endtime = new Date('2016-05-04T07:31:00Z');

      view.el.querySelector('#time-starttime').value = starttime.toISOString();
      view.el.querySelector('#time-endtime').value = endtime.toISOString();

      view.onTimeChange();

      expect(config.get('starttime').getTime()).to.equal(starttime.getTime());
    });
  });


});
