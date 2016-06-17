'use strict';

module.exports = {
  copy2DArray,
  arrayIsEqual2D
}

/**
 * Makes a copy of a 2D Arrays
 * @param {string[][]}
 * @returns {string[][]}
 */
function copy2DArray(array) {
  var newArray = [];
  for (let i = 0; i < array.length; i++) {
    newArray[i] = array[i].slice();
  }
  return newArray;
}

/**
 * Checks if 2 2D Arrays have the same length - and the same values at every position
 * @param {string[][]} array1
 * @param {string[][]} array2
 * @returns {boolean}
 */
function arrayIsEqual2D(array1, array2) {
  //Make sure arrays first array is the same length
  if (array1.length !== array2.length) return false;
  for (let i = 0; i < array1.length; i++) {
    //Make sure all inner arrays are the same length as well
    if (array1[i].length !== array2[i].length) return false;
    for (let j = 0; j < array1[i].length; j++) {
      //Make sure values are the same
      if (array1[i][j] !== array2[i][j]) return false;
    }
  }

  //If nothing changed - the arrays are exactly the same
  return true;
}