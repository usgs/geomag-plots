/* global describe, it */
'use strict';

var TimeseriesCollectionView = require('TimeseriesCollectionView');

describe('TimeseriesCollectionView test suite.', function () {
  describe('Constructor', function () {
    it('can be created and destroyed', function () {
      var view = TimeseriesCollectionView();
      view.destroy();
    });
  });
});
