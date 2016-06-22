'use strict';

module.exports = {
  getKey,
  getDepth,
  padString,
  invertBinaryString
}


/**
 * Creates the QuadKey from an X and Y Value
 * @param {number} x
 * @param {number} y
 * @returns {string}
 */
function getKey(x, y) {
  var result = "";
  var xKey = "";
  var yKey = "";
  var maxDepth = Math.max(getDepth(x), getDepth(y));

  if (x < 0) {
    xKey = invertBinaryString(padString((~x).toString(2), maxDepth));
  } else {
    xKey = padString(x.toString(2), maxDepth);
  }

if (y < 0) {
    yKey = invertBinaryString(padString((~y).toString(2), maxDepth));
  } else {
    yKey = padString(y.toString(2), maxDepth);
  }

  for(let i = 0; i < maxDepth; i++) {
    result += parseInt(xKey.substr(i,1) + yKey.substr(i,1), 2).toString(4);
  }

  return result;
}

function getDepth(value) {
  var updated_value = value < 0 ? ~value : value;
  if (updated_value === 0) {
    return 1;
  } else if (updated_value === 1) {
    return 2;
  } else {
    return Math.floor(Math.log2(updated_value)) + 2;
  }
}

/**
 * Pads a string with zeroes until it reaches the proper length
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
function padString(str, length) {
  var str_arr = str.split('');
  while (str_arr.length < length) str_arr.unshift('0');
  return str_arr.join('');
}

/**
 * Inverts a Binary STring
 */
function invertBinaryString(str) {
  return str.split('').reduce(function(prev, curr) {
    return prev += (curr === "0" ? "1" : "0");
  }, "")
}