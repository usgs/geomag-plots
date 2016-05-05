'use strict';

var View = require('mvc/View');


var view;

view = View({
  el: document.querySelector('#application')
});

view.render = function () {
  view.el.innerHTML = view.model.get('content');
};

view.model.set({
  content: 'js content'
});
