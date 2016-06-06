'use strict';


var Collection = require('mvc/Collection'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS = {
  title: 'Options',
  titleTag: 'h3'
};


var CompactSelectView = function (options) {
  var _this,
      _initialize,

      _container,

      _onContainerClick;


  options = Util.extend({}, _DEFAULTS, options);
  _this = View(options);

  _initialize = function (options) {
    _this.collection = options.collection || Collection();

    _this.title = options.title;
    _this.titleTag = options.titleTag;

    _this.createScaffold();
    _this.updateRenderedElements();
    _this.bindHandlers();
  };


  _onContainerClick = function (evt) {
    return _this.onContainerClick(evt);
  };


  _this.bindHandlers = function () {
    _this.collection.on('reset', 'onCollectionReset', _this);
    _this.collection.on('add', 'onCollectionAdd', _this);
    _this.collection.on('remove', 'onCollectionRemove', _this);

    _this.collection.on('select', 'onCollectionSelect', _this);
    _this.collection.on('deselect', 'onCollectionDeselect', _this);

    _container.addEventListener('click', _onContainerClick, _this);
  };

  _this.createScaffold = function () {
    _this.el.classList.add('compact-select-view');
    _this.el.innerHTML = [
      '<', _this.titleTag, '>', _this.title, '</', _this.titleTag, '>',
      '<div class="compact-select-view-options"></div>'
    ].join('');

    _container = _this.el.querySelector('.compact-select-view-options');
  };

  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return; // already destroyed
    }

    _this.unbindHandlers();

    _this.elementsContainer = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _this.onCollectionAdd = function () {
    _this.updateRenderedElements();
  };

  _this.onCollectionDeselect = function () {
    Array.prototype.forEach.call(
      _container.querySelectorAll('.selected'),
      function (el) {
        el.classList.remove('selected');
      }
    );
  };

  _this.onCollectionRemove = function () {
    _this.updateRenderedElements();
  };

  _this.onCollectionReset = function () {
    _this.updateRenderedElements();
  };

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

  _this.unbindHandlers = function () {
    _this.collection.off('reset', 'onCollectionReset', _this);
    _this.collection.off('add', 'onCollectionAdd', _this);
    _this.collection.off('remove', 'onCollectionRemove', _this);

    _this.collection.off('select', 'onCollectionSelect', _this);
    _this.collection.off('deselect', 'onCollectionDeselect', _this);

    _container.removeEventListener('click', _onContainerClick, _this);
  };

  _this.updateRenderedElements = function () {
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
