'use strict';


var Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS,
    _ID;

_DEFAULTS = {
  scales: [
    {display: 'Auto', value: 'null'},
    {display: '1,000 nT', value: '1000'},
    {display: '100 nT', value: '100'},
    {display: '10 nT', value: '10'}
  ],
  title: 'Scale View',
  titleTag: 'h3'
};

_ID = 0; // Identifier to keep multiple scale views separate


/**
 * This class provides an interface for the user to select either auto or
 * manual y-axis scaling.
 *
 */
var ScaleView = function (options) {
  var _this,
      _initialize,

      _id,
      _onContainerClick;


      // "yExtentSize"
  options = Util.extend({}, _DEFAULTS, options);
  _this = View(options);

  /**
   * @constructor
   *
   * Initializes a new {ScaleView} object.
   *
   * @param options.scales {Array}
   *     An array of available scale options. Each scale option should be an
   *     an object with a "display" and "value" property.
   * @param options.title {String}
   *     The title to display above the scale view interface.
   * @param options.titleTag {String}
   *     The HTML tag name to use for the title element.
   *
   */
  _initialize = function (options) {
    var yExtentSize;

    _id = _ID++;
    yExtentSize = _this.model.get('yExtentSize');
    // Stringify result
    if (yExtentSize === null) {
      yExtentSize = 'null';
    } else {
      yExtentSize = '' + yExtentSize;
    }

    _this.el.classList.add('scale-view');
    _this.el.innerHTML = [
      '<', options.titleTag, '>', options.title, '</', options.titleTag, '>',
      '<ul class="no-style">',
        options.scales.map(function (scale) {
          return [
            '<li>',
              '<input type="radio" name="yExtentSize" ',
                  'value="', scale.value, '" ',
                  'id="scale-value-', _id, '-', scale.value, '" ',
                  ((yExtentSize === scale.value) ? 'checked="checked"' : ''),
                  '/>',
              '<label for="scale-value-', _id, '-', scale.value, '">' +
                scale.display,
              '</label>',
            '</li>',
          ].join('');
        }).join(''),
      '</ul>'
    ].join('');

    _this.el.addEventListener('click', _onContainerClick, _this);
  };


  /**
   * Private event listener for DOMClick events on this view's element. This
   * method only calls the public version `_this.onClick`.
   *
   */
  _onContainerClick = function (evt) {
    _this.onClick(evt);
  };


  /**
   * Frees resources associated with this view. This method should only be
   * called once per instance, but subsequent calls should not cause errors.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return; // Already destroyed ...
    }

    _this.el.removeEventListener('click', _onContainerClick, _this);

    _id = null;
    _onContainerClick = null;

    _initialize = null;
    _this = null;
  };

  /**
   * Finds the associated input element for a DOMClick event. If the event
   * target is itself an input element, simply return that element. If the
   * event target is a label element, return the associated input element. If
   * the event target is anything else, return null.
   *
   *
   * @param evt {Object}
   *     An object with a `target` attribute that is an HTMLElement.
   *
   * @return {HTMLElement}
   *     The input element associated with the given `evt` or `null` if no
   *     such element exists.
   */
  _this.getElementForEvent = function (evt) {
    var element;

    element = evt.target;

    if (element.nodeName === 'LABEL') {
      element = _this.el.querySelector('#' + element.getAttribute('for'));
    }

    if (element && element.nodeName !== 'INPUT') {
      element = null;
    }

    return element;
  };

  /**
   * Event handler for click events on this view. The view utilizes event
   * delegation so this method must be implemented to match.
   *
   * This method finds the input element that was interacted with and then
   * updates the model `yExtentSize` property to the input's value.
   *
   * @param evt {Object}
   *     An object with a `target` attribute that is an HTMLElement.
   *
   */
  _this.onClick = function (evt) {
    var input,
        value;

    input = _this.getElementForEvent(evt);
    if (input) {
      value = input.getAttribute('value');

      if (value === 'null') {
        value = null;
      } else {
        value = parseInt(value, 10);
      }

      _this.model.set({yExtentSize: value});
    }
  };

  /**
   * Updates the view rendering.
   *
   * Checks the model's current `yExtentSize` property and ensures the
   * input with the corresponding value is rendered as selected.
   *
   */
  _this.render = function () {
    var input,
        yExtentSize;

    yExtentSize = _this.model.get('yExtentSize');

    // Remove checked class from other inputs
    Array.prototype.forEach.call(_this.el.querySelectorAll('[checked]'),
        function (el) { el.removeAttribute('checked'); });

    // Add check to the current input
    input = _this.el.querySelector('[value="' + yExtentSize + '"]');
    if (input) {
      input.setAttribute('checked', 'checked');
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ScaleView;
