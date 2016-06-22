/**
 * Helper Test
 */
var helper = require('../lib/helper.jsx');

var should = require('chai').should;
var expect = require('chai').expect;

describe('Helper Tests', function() {
  it('should wrap and unwrap keys from coordinates', function() {
    let assertions = [
      {x: 0,    y: 0,   key: '0' },
      {x: -4,   y: -1,  key: '311'},
      {x: 20,   y: -10, key: '130310'}
    ];

    assertions.forEach(function(assertion) {
      var created_key = helper.getKey(assertion.x, assertion.y);
      expect(created_key).to.equal(assertion.key);

      var created_coords = helper.getValuesFromKey(created_key);
      expect(created_coords.x).to.equal(assertion.x);
      expect(created_coords.y).to.equal(assertion.y);
    });
  });
});