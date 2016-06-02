'use strict';


var Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS = {
  scales: [
    {display: 'Auto', value: 'null'},
    {display: '1,000 nT', value: '1000'},
    {display: '100 nT', value: '100'},
    {display: '10 nT', value: '10'}
  ],
  title: 'Scale View',
  titleTag: 'h3'
};

var _ID = 0; // Identifier to keep multiple scale views separate


var ScaleView = function (options) {
  var _this,
      _initialize,

      _id,
      _onContainerClick;


      // "yExtentSize"
  options = Util.extend({}, _DEFAULTS, options);
  _this = View(options);

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


  _onContainerClick = function (evt) {
    _this.onClick(evt);
  };


  _this.destroy = function () {
    _this.el.removeEventListener('click', _onContainerClick, _this);

    _id = null;
    _onContainerClick = null;

    _initialize = null;
    _this = null;
  };

  _this.getElementForEvent = function (evt) {
    var element;

    element = evt.target;

    if (element.nodeName === 'LABEL') {
      element = document.querySelector('#' + element.getAttribute('for'));
    }

    if (element && element.nodeName !== 'INPUT') {
      element = null;
    }

    return element;
  };

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
