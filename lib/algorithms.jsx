import {getKey, getValuesFromKey, getDepth} from './helper';
import {Node} from './tree_node';
import _ from 'lodash';

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
  let values = boardValues;
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

  //Setup the four quadrants (if they're on the board)
  //the child at 0 - (0,0) is the root
  active.children['0'] = root;
  if (!isOffBoard({x: checker.x,     y: checker.y + -1 }, size)) active.children['1'] = new Node(0, -1, root);
  if (!isOffBoard({x: checker.x - 1, y: checker.y },      size)) active.children['2'] = new Node(-1, 0, root);
  if (!isOffBoard({x: checker.x - 1, y: checker.y + -1 }, size)) active.children['3'] = new Node(-1, -1, root);

  active.visit();
  number_moves++;

  yield {
    x: curr_loc.x,
    y: curr_loc.y,
    value: 'X' //Root has been visited
  };

  while (true) {
    //First get the location and check if the node exists
    abs_loc = {x: checker.x + curr_loc.x, y: checker.y + curr_loc.y};
    let dir = values[abs_loc.y][abs_loc.x]
    let move = getMovement(dir);

    console.log(move, dir);

    curr_loc.x += move.x;
    curr_loc.y += move.y;

    abs_loc.x = curr_loc.x + checker.x;
    abs_loc.y = curr_loc.y + checker.y;

    //Do a check to see if the new location to move to is off the board, if so we win!
    if (isOffBoard(abs_loc, size)) {
      yield {
        completed: true,
        status: 'success',
        description: `Checker exited the board in ${number_moves} moves!`
      }
    }

    //Traverse Tree to see if node exists
    let done = false, exists = false, target_node;
    let key_to_check = getKey(curr_loc.x, curr_loc.y);
    let depth = 0;

    let max_depth = key_to_check.length;

    //Create a link to active so we can traverse the tree without changing what active is pointing to
    let check_node = root;

    console.log(`starting loop to check key ${key_to_check}`);
    while(!done) {
      //Traverse Each depth level - get the key for this depth level
      var depth_key = key_to_check.substr(depth, 1);
      console.log(`checking key ${depth_key} at depth ${depth}`);
      if (check_node.children[depth_key]) {
        check_node = check_node.children[depth_key];
        depth++;
        number_moves++;
        yield {
          x: check_node.x,
          y: check_node.y
        }

        //If the key matches - this is the target node
        if (check_node.key === key_to_check) {
          console.log('new check node key matches full key!');
          target_node = check_node;
          exists = true;
          done = true;
        } else if (depth > max_depth) {
          //If we somehow go past the max_depth - exit
          done = true;
        }
      } else {
        console.log(`no key at depth ${depth}`)
        //We couldn't find it
        done = true;
      }
    }

    //If the node exists, check to see if it's visited - if so, finish
    if (exists) {
      if (target_node.visited) {
        number_moves++;
        yield {
          completed: true,
          status: 'failure',
          description: `Path intercepted itself in  ${number_moves} moves!`
        }
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
      let current_depth = 0;
      let check_node = root;
      while (!inserted) {
        //Start at the Root and Check
        let curr_key = node_to_insert.key.substr(current_depth, 1);
        console.log("Checking the current key", curr_key, " against ", node_to_insert.key);
        //If the currently checked node doesn't have a child with the current key value, lets add a node
        if (!check_node.children[curr_key]) {
          if (current_depth === node_to_insert.key.length) {
            console.log(`Inserting New Node! ${curr_key} at depth: ${current_depth}`)
            //If the current depth is equal to the key length, this is the final node, so insert the node to insert
            check_node.children[curr_key] = node_to_insert;
            inserted = true;
            break;
          } else {
            let partial_key = node_to_insert.key.substr(0, current_depth + 1);
            let new_val = getValuesFromKey(partial_key);
            let new_child = new Node(new_val.x, new_val.y);
            console.log(`Creating new child at ${new_val.x}, ${new_val.y} on the current key: "${curr_key}" at depth: ${current_depth}`)
            check_node.children[curr_key] = new_child;
            new_child.parent = check_node;

            //Set the Check node to the new child and enter that node
            check_node = new_child;
            current_depth++;
            number_moves++;
            yield { //non-visited node
              x: check_node.x,
              y: check_node.y,
              value: "O"
            };
          }
        } else {
          console.log(`Updating Check Node with current_key ${curr_key} at depth: ${current_depth}`);
          //Otherwise if it does have a node, set the check node to that node and continue
          check_node = check_node.children[curr_key];
          console.log(check_node);
          current_depth++;
          number_moves++;
          yield {
            x: check_node.x,
            y: check_node.y
          }
        }
      }

      active.neighbors[dir] = node_to_insert;
      node_to_insert.neighbors[swapDirection(dir)] = active;
      node_to_insert.visit();
      active = node_to_insert;
      number_moves++;
      yield {
        x: active.x,
        y: active.y,
        value: 'X'
      };
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
