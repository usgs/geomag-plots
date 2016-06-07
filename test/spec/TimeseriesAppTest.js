/* global afterEach, beforeEach, chai, describe, it, sinon */
'use strict';


var Collection = require('mvc/Collection'),
    TimeseriesApp = require('plots/TimeseriesApp'),
    Xhr = require('util/Xhr');


var expect = chai.expect;


describe('plots/TimeseriesApp', function () {
  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof TimeseriesApp).to.equal('function');
    });
  });

  describe('loadCollection', function () {
    var app,
        collection;

    beforeEach(function () {
      app = TimeseriesApp();
      collection = Collection();
      sinon.stub(Xhr, 'ajax', function () {});
    });

    afterEach(function () {
      app = null;
      collection = null;
      Xhr.ajax.restore();
    });

    it('sets collection error status', function () {
      collection.reset([{id: 1}, {id: 2}]);
      app.loadCollection({
        collection: collection,
        url: 'test url'
      });

      expect(Xhr.ajax.calledOnce).to.equal(true);
      // call error callback
      Xhr.ajax.getCall(0).args[0].error('error status');
      expect(collection.error).to.equal('error status');
      expect(collection.data().length).to.equal(0);
    });

    it('resets collection with features', function () {
      var data = {
        features: [
          {id: 3},
          {id: 4}
        ]
      };

      collection.error = true;
      collection.reset([{id: 2}]);
      app.loadCollection({
        collection: collection,
        url: 'test url'
      });

      expect(Xhr.ajax.calledOnce).to.equal(true);
      // call error callback
      Xhr.ajax.getCall(0).args[0].success(data);
      expect(collection.error).to.equal(false);
      expect(collection.data().length).to.equal(2);
      expect(collection.data()[0].id).to.equal(3);
    });
  });

  describe('sortByLatitudeDescending', function () {
    it('sorts by geojson feature latitude descending', function () {
      var app,
          data;

      app = TimeseriesApp();
      data = [
        {
          id: 'c',
          geometry: {
            coordinates: [0, 5]
          }
        },
        {
          id: 'b',
          geometry: {
            coordinates: [0, 6]
          }
        },
        {
          id: 'a',
          geometry: {
            coordinates: [0, 4]
          }
        }
      ];
      data.sort(app.sortByLatitudeDescending);
      expect(data[0].id).to.equal('b');
      expect(data[1].id).to.equal('c');
      expect(data[2].id).to.equal('a');
    });
  });
});
