'use strict';


var Collection = require('mvc/Collection'),
    CompactSelectView = require('plots/CompactSelectView');


var collection,
    view;


collection = Collection([
  {id: 1, properties: {name: 'Option 1'}},
  {id: 2, properties: {name: 'Option 2'}},
  {id: 3, properties: {name: 'Option 3'}},
  {id: 4, properties: {name: 'Option 4'}},
  {id: 5, properties: {name: 'Option 5'}},
  {id: 6, properties: {name: 'Option 6'}}
]);

view = CompactSelectView({
  collection: collection,
  el: document.querySelector('#example')
});

document.querySelector('#deselect').addEventListener('click', function () {
  collection.deselect();
});
