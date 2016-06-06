/* global mocha */
'use strict';


mocha.setup('bdd');


// Add each test class here as they are implemented
require('./spec/D3GraphViewTest');
require('./spec/ExampleTest');

require('./spec/D3TimeseriesViewTest');
require('./spec/ScaleViewTest');
require('./spec/TimeseriesAppTest');
require('./spec/TimeseriesCollectionViewTest');
require('./spec/TimeseriesFactoryTest');
require('./spec/TimeseriesManagerTest');
require('./spec/TimeseriesManagerRequestTest');
require('./spec/TimeseriesResponseTest');
require('./spec/TimeseriesSelectViewTest');
require('./spec/TimeseriesTest');
require('./spec/TimeseriesViewTest');


if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  mocha.run();
}
