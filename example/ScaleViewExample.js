'use strict'

var Model = require('mvc/Model'),
    ScaleView = require('plots/ScaleView');


var log,
    model,
    scaleView;

log = document.querySelector('#log > code');
model = Model();

scaleView = ScaleView({
  el: document.querySelector('#example'),
  model: model
});

model.on('change', function () {
  log.innerHTML = JSON.stringify(model.toJSON(), null, '  ');
});
