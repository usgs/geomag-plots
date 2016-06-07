/* global chai, describe, it, sinon */
'use strict';

var D3GraphView = require('plots/D3GraphView'),
    Model = require('mvc/Model');

var expect = chai.expect;

var changes,
    plotModel;

changes = {
  'zoomScale': 2,
  'zoomTranslate': [
    1,
    2
  ]

};

plotModel = Model({
  'zoomScale': 1,
  'zoomTranslate': [
    -0.8617363393199184,
    -0.11143880419554364
  ]
});

describe('D3GraphViewTest', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof D3GraphView).to.equal('function');
    });

    it('can be destroyed', function () {
      var view;

      view = D3GraphView({
        plotModel: plotModel
      });

      expect(view.destroy).to.not.throw(Error);
    });
  });

  describe('renderZoom', function () {
    it('calls render', function () {
      var view;

      view = D3GraphView({
        plotModel: plotModel
      });

      sinon.stub(view, 'render', function () {});
      view.renderZoom(changes);

      expect(view.render.callCount).to.equal(1);

      view.render.restore();
      view.destroy();
    });
  });
});
