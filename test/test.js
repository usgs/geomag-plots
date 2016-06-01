/* global mocha */
'use strict';


mocha.setup('bdd');


// Add each test class here as they are implemented
require('./spec/ExampleTest');

require('./spec/ObservatoryFactoryTest');
require('./spec/TimeseriesCollectionViewTest');
require('./spec/TimeseriesFactoryTest');
require('./spec/TimeseriesResponseTest');
require('./spec/TimeseriesSelectViewTest');
require('./spec/TimeseriesTest');
require('./spec/TimeseriesViewTest');


if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  mocha.run();
}
