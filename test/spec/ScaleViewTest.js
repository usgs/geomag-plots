/* global afterEach, beforeEach, chai, describe, it, sinon */
'use strict';


var Model = require('mvc/Model'),
    ScaleView = require('plots/ScaleView');


var expect = chai.expect;


describe('plots/ScaleView', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof ScaleView).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(ScaleView).to.not.throw(Error);
    });

    it('can be destroyed', function () {
      var view;

      view = ScaleView();

      expect(view.destroy).to.not.throw(Error);

      view.destroy(); // Ensures double-destroys are not a problem
    });

    it('initially selects the correct option', function () {
      var checked,
          view;

      view = ScaleView({
        model: Model({yExtentSize: null})
      });

      checked = view.el.querySelector('[checked]');

      expect(checked.getAttribute('value')).to.equal('null');

      view.destroy();
    });
  });

  describe('getElementForEvent', function () {
    var view;

    beforeEach(function () {
      view = ScaleView();
    });

    afterEach(function () {
      view.destroy();
    });

    it('finds the element if target is input', function () {
      var evt,
          result;

      evt = {
        target: view.el.querySelector('input')
      };

      result = view.getElementForEvent(evt);
      expect(result).to.equal(view.el.querySelector('input'));
    });

    it('finds the element if target is label', function () {
      var evt,
          result;

      evt = {
        target: view.el.querySelector('label')
      };

      result = view.getElementForEvent(evt);
      expect(result).to.equal(view.el.querySelector('input'));
    });

    it('returns null if target is neither label nor input', function () {
      var evt,
          result;

      evt = {
        target: view.el
      };

      result = view.getElementForEvent(evt);
      expect(result).to.equal(null);
    });
  });

  describe('onClick', function () {
    it('properly updates the model value', function () {
      var evt,
          model,
          view;

      model = Model();
      view = ScaleView({model: model});
      evt = {target: view.el.querySelector('label')};
      sinon.spy(model, 'set');

      view.onClick(evt);

      expect(model.set.callCount).to.equal(1);

      expect(model.set.firstCall.args).to.deep.equal([{yExtentSize: null}]);

      model.set.restore();
      view.destroy();
      model.destroy();
    });
  });

  describe('render', function () {
    it('selects the correct input', function () {
      var result,
          view;

      view = ScaleView();

      view.model.set({yExtentSize: 100});
      view.render();

      result = view.el.querySelectorAll('[checked]');

      expect(result.length).to.equal(1);
      expect(result.item(0)).to.equal(view.el.querySelector('[value="100"]'));

      view.destroy();
    });
  });
});
