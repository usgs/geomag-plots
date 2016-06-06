/* global chai, describe, it */
'use strict';


var CompactSelectView = require('plots/CompactSelectView');


var expect = chai.expect;


describe('plots/CompactSelectView', function () {
  describe('constructor', function () {
    it('should be defined', function () {
      expect(typeof CompactSelectView).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(CompactSelectView).to.not.throw(Error);
    });

    it('can be destroyed', function () {
      var view;

      view = CompactSelectView();

      expect(view.destroy).to.not.throw(Error);
      expect(view.destroy).to.not.throw(Error); // double-destroy should be ok

      view.destroy();
    });
  });
});
