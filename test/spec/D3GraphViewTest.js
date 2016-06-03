/* global chai, describe, it */
'use strict';

var D3GraphView = require('plots/D3GraphView');

var expect = chai.expect;

describe('D3GraphViewTest', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof D3GraphView).to.equal('function');
    });

    // it('can be destroyed', function () {
    //   var view;
    //
    //   view = D3GraphView();
    //
    //   expect(view.destroy).to.not.throw(Error);
    // });
  });
});
