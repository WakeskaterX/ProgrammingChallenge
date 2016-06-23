import {getKey} from './helper';
/**
 * This is a search tree to keep track of visited nodes
 *
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {string} value
 */
function Node(x, y, parent) {
  this.x = x;
  this.y = y;
  this.key = getKey(x, y);
  this.visited = false;

  //Parent Node
  this.parent = parent || null;

  //Children is how we traverse the tree
  this.children = {
    '0': null, //0,0
    '1': null, //0,1
    '2': null, //1,0
    '3': null  //1,1
  };

  //Neighbors track exactly which nodes are 'touching'
  this.neighbors = {
    'U': null,
    'R': null,
    'D': null,
    'L': null
  };
}

/**
 * Sets visited to true
 */
Node.prototype.visit = function() {
  this.visited = true;
}

module.exports = {
  Node
};




