/* global afterEach, before, beforeEach, chai, describe, it, sinon */
'use strict';


var Collection = require('mvc/Collection'),
    CompactSelectView = require('plots/CompactSelectView');


var expect = chai.expect;

var collectionItems;

describe('plots/CompactSelectView', function () {
  before(function () {
    collectionItems = [
      {id: 1, properties: {name: 'Option 1'}},
      {id: 2, properties: {name: 'Option 2'}},
      {id: 3, properties: {name: 'Option 3'}},
      {id: 4, properties: {name: 'Option 4'}},
      {id: 5, properties: {name: 'Option 5'}},
      {id: 6, properties: {name: 'Option 6'}}
    ];
  });

  describe('constructor', function () {
    it('should be defined', function () {
      expect(typeof CompactSelectView).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(CompactSelectView).to.not.throw(Error);
    });

    it('can be destroyed', function () {
      var view;

      view = CompactSelectView();

      expect(view.destroy).to.not.throw(Error);
      expect(view.destroy).to.not.throw(Error); // double-destroy should be ok

      view.destroy();
    });
  });

  describe('bindHanders', function () {
    it('binds to all necessary events', function () {
      var view;

      view = CompactSelectView();

      sinon.spy(view.collection, 'on');

      view.bindHandlers();

      expect(view.collection.on.callCount).to.equal(5);

      view.collection.on.restore();
      view.destroy();
    });
  });

  describe('createScaffold', function () {
    it('creates an empty skeleton', function () {
      var view;

      view = CompactSelectView();
      view.el = document.createElement('div'); // Clean it out ...

      view.createScaffold();

      expect(view.el.childNodes.length).to.equal(2);
      expect(view.el.querySelectorAll('h3').length).to.equal(1);
      expect(view.el.querySelectorAll('.compact-select-view-items').length)
          .to.equal(1);

      view.destroy();
    });
  });

  describe('onCollectionAdd', function () {
    it('calls correct sub-method', function () {
      var view;

      view = CompactSelectView();
      sinon.spy(view, 'updateRenderedItems');

      view.onCollectionAdd();

      expect(view.updateRenderedItems.callCount).to.equal(1);

      view.updateRenderedItems.restore();
      view.destroy();
    });
  });

  describe('onCollectionDeselect', function () {
    it('removes selected class from all items', function () {
      var view;

      view = CompactSelectView({
        collection: Collection(collectionItems.slice(0))
      });

      Array.prototype.forEach.call(
        view.el.querySelectorAll('a'),
        function (el) {
          el.classList.add('selected');
        }
      );

      expect(view.el.querySelectorAll('.selected').length).to.equal(6);
      view.onCollectionDeselect();
      expect(view.el.querySelectorAll('.selected').length).to.equal(0);

      view.destroy();
    });
  });

  describe('onCollectionRemove', function () {
    it('calls correct sub-method', function () {
      var view;

      view = CompactSelectView();
      sinon.spy(view, 'updateRenderedItems');

      view.onCollectionRemove();

      expect(view.updateRenderedItems.callCount).to.equal(1);

      view.updateRenderedItems.restore();
      view.destroy();
    });
  });


  describe('onCollectionReset', function () {
    it('calls correct sub-method', function () {
      var view;

      view = CompactSelectView();
      sinon.spy(view, 'updateRenderedItems');

      view.onCollectionReset();

      expect(view.updateRenderedItems.callCount).to.equal(1);

      view.updateRenderedItems.restore();
      view.destroy();
    });
  });

  describe('onCollectionSelect', function () {
    it('selects the item that is selected in the collection', function () {
      var view;

      view = CompactSelectView({
        collection: Collection(collectionItems)
      });

      view.collection.select(view.collection.data()[0]); // select something

      // make sure nothing is selected yet
      view.onCollectionDeselect();

      view.onCollectionSelect();
      expect(view.el.querySelectorAll('.selected').length).to.equal(1);

      view.destroy();
    });
  });

  describe('onContainerClick', function () {
    var view;

    beforeEach(function () {
      view = CompactSelectView({
        collection: Collection(collectionItems)
      });
      sinon.spy(view.collection, 'select');
    });

    afterEach(function () {
      view.collection.select.restore();
      view.destroy();
    });


    it('does nothing if event is not an item', function () {
      view.onContainerClick({target: document.createElement('a')});

      expect(view.collection.select.callCount).to.equal(0);
    });

    it('calls select with correct collection item', function () {
      var target;

      target = document.createElement('a');
      target.classList.add('compact-select-view-item');
      target.setAttribute('data-id', 1);

      view.onContainerClick({target: target});

      expect(view.collection.select.callCount).to.equal(1);
      expect(view.collection.select.calledWith(view.collection.get(1)))
          .to.equal(true);
    });
  });

  describe('updateRenderedItems', function () {
    it('creates markup for each item in the collection', function () {
      var view;

      view = CompactSelectView({
        collection: Collection(collectionItems)
      });

      view.createScaffold(); // ensure view is empty

      view.updateRenderedItems();
      expect(view.el.querySelectorAll('.compact-select-view-item').length)
          .to.equal(6);

      view.destroy();
    });
  });
});
