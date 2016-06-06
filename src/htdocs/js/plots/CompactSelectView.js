'use strict';


var Collection = require('mvc/Collection'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS = {
  title: 'Options',
  titleTag: 'h3'
};


/**
 * This view provides a compact view of a {Collection} and allows the user to
 * click on any collection item to select it in the collection. The {Collection}
 * must contain native Javascipt objects with "id" and "properties" attributes.
 * The properties attribute should point to an object with a "name" attribute.
 *
 * For example:
 *
 * Collection([{id: 1, properties: {name: "Item Number One"}}])
 *
 */
var CompactSelectView = function (options) {
  var _this,
      _initialize,

      _container,

      _onContainerClick;


  options = Util.extend({}, _DEFAULTS, options);
  _this = View(options);

  /**
   * @constructor
   *
   * Creates a new view for a collection.
   *
   * @param options.collection {Collection}
   *     The {Collection} to render.
   * @param options.title {String}
   *     The header to label this view with.
   * @param options.titleTag {String}
   *     The HTML tag name to use for the title header.
   */
  _initialize = function (options) {
    _this.collection = options.collection || Collection();

    _this.title = options.title;
    _this.titleTag = options.titleTag;

    _this.createScaffold();
    _this.updateRenderedItems();
    _this.bindHandlers();
  };


  /**
   * Private method event handler for DOM click events on the container.
   * This method simply delegates to a public function for extension.
   *
   * @param evt {DOMEvent}
   *     The click event that triggered this call.
   */
  _onContainerClick = function (evt) {
    return _this.onContainerClick(evt);
  };


  /**
   * Binds event handlers to the collection in order to update the rendering
   * in the page. Also binds event handlers to DOM events to update the
   * collection.
   *
   */
  _this.bindHandlers = function () {
    _this.collection.on('reset', 'onCollectionReset', _this);
    _this.collection.on('add', 'onCollectionAdd', _this);
    _this.collection.on('remove', 'onCollectionRemove', _this);

    _this.collection.on('select', 'onCollectionSelect', _this);
    _this.collection.on('deselect', 'onCollectionDeselect', _this);

    _container.addEventListener('click', _onContainerClick, _this);
  };

  /**
   * Creates an empty scaffolding for the view. No items are rendered in
   * the scaffold as part of this method.
   *
   */
  _this.createScaffold = function () {
    _this.el.classList.add('compact-select-view');
    _this.el.innerHTML = [
      '<', _this.titleTag, '>', _this.title, '</', _this.titleTag, '>',
      '<div class="compact-select-view-items"></div>'
    ].join('');

    _container = _this.el.querySelector('.compact-select-view-items');
  };

  /**
   * Frees resources associated with this view.
   *
   */
  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return; // already destroyed
    }

    _this.unbindHandlers();

    _this.elementsContainer = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  /**
   * Event handler called when items are added to the collection. Calls
   * the `updateRenderedItems` method.
   *
   */
  _this.onCollectionAdd = function () {
    _this.updateRenderedItems();
  };

  /**
   * Event handler called when an item is deselected in the collection.
   * Removes the `selected` class from all children of the container.
   *
   */
  _this.onCollectionDeselect = function () {
    Array.prototype.forEach.call(
      _container.querySelectorAll('.selected'),
      function (el) {
        el.classList.remove('selected');
      }
    );
  };

  /**
   * Event handler called when items are removed from the collection. Calls
   * the `updateRenderedItems` method.
   *
   */
  _this.onCollectionRemove = function () {
    _this.updateRenderedItems();
  };

  /**
   * Event handler called when the collection is reset. Calls
   * the `updateRenderedItems` method.
   *
   */
  _this.onCollectionReset = function () {
    _this.updateRenderedItems();
  };

  /**
   * Event handler called when an item is selected in the collection. Finds
   * the DOM element corresponding to the selected item and adds the
   * `selected` class to is.
   *
   */
  _this.onCollectionSelect = function () {
    var el,
        selected;

    selected = _this.collection.getSelected();

    if (selected) {
      el = _container.querySelector('[data-id="' + selected.id + '"]');

      if (el) {
        el.classList.add('selected');
      }
    }
  };

  /**
   * Event handler for click events on the container. Finds the item in the
   * collection corresponding to the clicked DOM element and select that item.
   *
   * @param evt {DOMEvent}
   *     The click event that triggered this call.
   */
  _this.onContainerClick = function (evt) {
    var id,
        obj,
        target;

    target = evt.target;

    if (target && target.classList.contains('compact-select-view-item')) {
      id = target.getAttribute('data-id');

      obj = _this.collection.get(id);

      if (obj) {
        _this.collection.select(obj);
      }
    }
  };

  /**
   * Removes event handlers from collection and DOM container.
   *
   */
  _this.unbindHandlers = function () {
    _this.collection.off('reset', 'onCollectionReset', _this);
    _this.collection.off('add', 'onCollectionAdd', _this);
    _this.collection.off('remove', 'onCollectionRemove', _this);

    _this.collection.off('select', 'onCollectionSelect', _this);
    _this.collection.off('deselect', 'onCollectionDeselect', _this);

    _container.removeEventListener('click', _onContainerClick, _this);
  };

  /**
   * Updates the set of available items in the DOM based on what is currently
   * in the collection. The currently selected items should remain rendered
   * as such.
   *
   */
  _this.updateRenderedItems = function () {
    _container.innerHTML = _this.collection.data().map(
      function (obj) {
        var title;

        if (obj.properties && obj.properties.name) {
          title = 'title="' + obj.properties.name + '" ';
        } else {
          title = '';
        }

        return [
          '<a class="compact-select-view-item" ',
              title,
              'href="javascript:void(null);" ',
              'data-id="', obj.id, '">',
            obj.id,
          '</a>'
        ].join('');
      }
    ).join('');

    _this.onCollectionSelect(); // ensure selected obj remains selected
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = CompactSelectView;
