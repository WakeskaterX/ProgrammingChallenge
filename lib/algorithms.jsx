import {rotateDirection, getDir, getRingDistance, getDistance} from './helper';

module.exports = {
  'algorithm_solve_for_checker': solveChecker2
}

/**
 * Algorithms are Generators that can be called per step to get the next value to display
 *
 * During Processing:
 * {
 *   x: 0,
 *   y: 5,
 *   value: 'X' -- X for visited, 'O' for not visited
 *   curr: { x: 0, y: 1 }
 * }
 *
 * Finished Yield:
 * {
 *   completed: true,
 *   status: 'success' or 'failure'
 *   description: 'failed to reach outside - reaches infinite loop in X moves
 *               or 'success - reaches border in X moves'
 * }
 */

/**
 * Note: Ideally a lot of this functionality would be modular and part of the TreeNode module, but, since I'm using a generator to allow stepping
 * through the algorithm, it's all in the algorithm function
 *
 *
 */
function* solveChecker2(boardValues, checkerLocation, boardSize) {
  let values = boardValues; //Direct Reference to the Values
  let checker = checkerLocation;
  let size = boardSize;
  let number_moves = 0;
  let furthest_ring = 0;

  //Current Local Location
  let curr_loc = {x: 0, y: 0};
  let abs_loc = {x: checker.x + curr_loc.x, y: checker.y + curr_loc.y};

  //Create Root Node
  let root = new Node(curr_loc.x, curr_loc.y);
  let active = root;

  //Setup the four quadrants
  //the child at 0 - (0,0) is the root
  root.children('0') = root;
  root.children('1') = new Node(-1, 0);
  root.children('2') = new Node(0, -1);
  root.children('3') = new Node(-1, -1);

  root.visit();
  number_moves++;

  yield {
    x: abs_loc.x,
    y: abs_loc.y,
    value: 'X' //Root has been visited
  };

  while (true) {
    //First get the location and check if the node exists
    let dir = values[abs_loc.y][abs_loc.x]
    let move = getMovement(dir);

    curr_loc.x += move.x;
    curr_loc.y += move.y;

    abs_loc.x = curr_loc.x + checker_loc.x;
    abs_loc.y = curr_loc.y + checker_loc.y;

    //Do a check to see if the new location to move to is off the board, if so we win!
    if (isOffBoard(abs_loc, size)) {
      //finish(); TODO
    }

    //Traverse Tree to see if node exists
    let done = false, exists = false, target_node;
    let key_to_check = getKey(curr_loc.x, curr_loc.y);
    let depth = 0;

    let max_depth = key_to_check.length();

    //Create a link to active so we can traverse the tree without changing what active is pointing to
    let check_node = active;
    while(!done) {
      //Traverse Each depth level - get the key for this depth level
      var depth_key = key_to_check.substr(0, 1);
      if (check_node.children[depth_key]) {
        check_node = check_node.children[depth_key];
        depth++;
        yield {
          x: check_node.x,
          y: check_node.y
        }

        //If the key matches - this is the target node
        if (check_node.key === key_to_check) {
          target_node = check_node;
          exists = true;
          done = true;
        } else if (depth > max_depth) {
          //If we somehow go past the max_depth - exit
          done = true;
        }
      } else {
        //We couldn't find it
        done = true;
      }
    }

    //If the node exists, check to see if it's visited - if so, finish
    if (exists) {
      if (target_node.visited) {
        //FINISH //todo
      } else {
        //Link target_node to active node and set to visited
        active.neighbors[dir] = target_node;
        target_node.neighbors[swapDirection(dir)] = active;
        target_node.visit();
        active = target_node;
        //Yield new active node
        number_moves++;
        yield {
          x: active.x,
          y: active.y,
          value: 'X'
        };
      }
    } else {
      //Create a new NODE and set as active
      let inserted = false;
      let node_to_insert = new Node(curr_loc.x, curr_loc.y);
      let insert_key_x = node_to_insert.key.split(',')[0];
      let insert_key_y = node_to_insert.key.split(',')[1];
      while (!inserted) {

      }
    }
  }
}

/**
 * Takes the Current Value (U, D, L, R) and the x and y and returns the x and y of the next location to check
 * @param {string} direction
 * @returns {object} adjustment: {x,y}
 */
function getMovement(direction) {
  switch (direction) {
    case 'U':
      return {
        x: 0, y: -1
      };
    case 'R':
      return {
        x: 1, y: 0
      };
    case 'D':
      return {
        x: 0, y: 1
      };
    case 'L':
      return {
        x: -1, y: 0
      };
  }
}

function swapDirection(direction) {
  switch (direction) {
    case 'U': return 'D';
    case 'D': return 'U';
    case 'L': return 'R';
    case 'R': return 'L';
  }
}

/**
 * Takes a 2D Vector and the size of the board and determines if the position vector is on the board or not
 * @param {object} position - {x,y}
 * @param {number} board_size
 */
function isOffBoard(position, board_size) {
  if (position.x < 0 || position.x >= board_size || position.y < 0 || position.y >= board_size) {
    return true;
  } else {
    return false;
  }
}
