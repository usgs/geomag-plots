/* global chai, describe, it */
'use strict';

var expect = chai.expect,

    Collection = require('mvc/Collection'),
    Timeseries = require('plots/Timeseries'),
    TimeseriesCollectionView = require('plots/TimeseriesCollectionView');

describe('TimeseriesCollectionView test suite.', function () {
  describe('Constructor', function () {
    it('can be created and destroyed', function () {
      var view = TimeseriesCollectionView({
          el:document.createElement('div'),
          collection: Collection()
        });
      view.destroy();
    });
  });

  describe('view collection is updated.', function () {
    var collection = Collection(),
        timeseriesCollectionView = TimeseriesCollectionView({
            el:document.createElement('div'),
            collection:collection}),
        timeseries = Timeseries({
          id: 0,
          times: [1],
          values: [1],
          metadata: {
            observatory: 'BOU',
            element: 'H',
            nominal: 0
          }
        });

    collection.add(timeseries);
    expect(timeseriesCollectionView.el.childNodes[0].
        childNodes.length).to.equal(1);
  });
});
