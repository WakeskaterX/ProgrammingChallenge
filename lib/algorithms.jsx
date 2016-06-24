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
  root.is_root = true;

  root.children['0'] = new Node(0, 0, root);
  if (!isOffBoard({x: checker.x,     y: checker.y - 1 }, size))  root.children['1'] = new Node(0, -1, root);
  if (!isOffBoard({x: checker.x - 1, y: checker.y },      size)) root.children['2'] = new Node(-1, 0, root);
  if (!isOffBoard({x: checker.x - 1, y: checker.y - 1 }, size))  root.children['3'] = new Node(-1, -1, root);

  //Remove the Root Key -- we should never be using this to check keys -- also setting to an empty string helps
  //for length checks if we're at the root
  root.key = "";

  //Move to Roots 0 Child
  let active = root.children['0'];
  active.visit();
  number_moves++;

  yield {
    x: curr_loc.x,
    y: curr_loc.y,
    value: 'X' //Root has been visited
  };

  let finished = false;
  while (!finished) {
    //First get the location and check if the node exists
    abs_loc = {x: checker.x + curr_loc.x, y: checker.y + curr_loc.y};
    let dir = values[abs_loc.y][abs_loc.x]
    let move = getMovement(dir);

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
      finished = true;
      break;
    }

    //Traverse Tree to see if node exists
    let done = false, exists = false, target_node;

    //First get the NEW key to see if it already exists in our tree somewhere
    //The current location (active) might be on a different branch so get the closest PARENT that
    //matches the path
    let key_to_check = getKey(curr_loc.x, curr_loc.y);

    //set check node to nearest parent (up to the root)
    let check_node = getNearestParent(active, key_to_check) || root;

    //If the check node IS the parent - which can happen if you move from say 23 => 2
    //Then skip looking for it:
    if (check_node.key === key_to_check) {
      done = true;
      exists = true;
      target_node = check_node;
    }

    //Set Starting Depth.  This is the SLOT in the KEY that we will check the check_node to see if it exists
    //For example, if key_to_check is 232 and our existing node is 2  we'd want to get '3' as the value, so depth would be 1
    //If key_to_check is 1 and the check node key is 0 we'd want a depth zero because we're checking against the root
    let depth = check_node.key.length;

    while(!done) {
      //Traverse Each depth level - get the key for this depth level
      //The Depth Key is the key to check's location that we want to check for
      //For example, if we're checking key:  232 and we're checking against node 23... we want a depth of 2 and a depth_key of 2
      var depth_key = key_to_check.substr(depth, 1);

      //If the check node HAS a child with the depth key, we need to check that child.
      if (check_node.children[depth_key]) {
        check_node = check_node.children[depth_key];
        depth++;
        number_moves++;

        yield {
          x: check_node.x,
          y: check_node.y,
          value: !check_node.visited ? 'O': undefined
        };

        //If the new child of the check node has a key that matches our key to check
        //We found the node we were looking for - so set exists and done to true, and set it as our target
        if (check_node.key === key_to_check) {
          target_node = check_node;
          exists = true;
          done = true;
        }
      } else {
        //If the check_node parent didn't have this depth key
        //It means the node doesn't exist in the tree yet
        exists = false;
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
        finished = true;
        break;
      } else {
        //If the node exists but it is NOT visited
        //Link to the active node as neighbors
        //And then visit it, and then set active to the new node
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
      //Otherwise if we have NOT found the node we need to create a brand new node, and insert it into
      //the tree.  First create a new node at the target X and Y location
      let inserted = false;
      let node_to_insert = new Node(curr_loc.x, curr_loc.y);

      //Similar to before, we want the nearest parent to the active node so we can recurse to find the correct spot to insert the
      //target node_to_insert
      let check_node = getNearestParent(active, node_to_insert.key);
      let current_depth = check_node.key.length;

      //Start looping through the tree
      while (!inserted) {
        //Similar to the depth key, we want the curr_key which is the new nodes access key to the tree
        let curr_key = node_to_insert.key.substr(current_depth, 1);

        //If the currently checked node doesn't have a child with the current key value, lets add a node
        if (!check_node.children[curr_key]) {
          //If the current depth is 1 less than the node_to_inserts key length - that means we
          //Are at the proper depth in the tree and should insert our key here
          if (current_depth === node_to_insert.key.length - 1) {
            //If the current depth is equal to the key length, this is the final node, so insert the node to insert
            check_node.children[curr_key] = node_to_insert;
            node_to_insert.parent = check_node;
            inserted = true;
            break;
          } else {
            let partial_key = check_node.key + curr_key;
            let new_val = getValuesFromKey(partial_key);
            let new_child = new Node(new_val.x, new_val.y, check_node);
            check_node.children[curr_key] = new_child;

            //Set the Check node to the new child and enter that node
            check_node = new_child;
            current_depth++;
            number_moves++;
            yield {
              x: check_node.x,
              y: check_node.y,
              value: "O"
            };
          }
        } else {
          //Otherwise if it does have a node, set the check node to that node and continue
          check_node = check_node.children[curr_key];
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

/**
 * Takes a direction and reverses the key
 * @param {string} direction
 * @returns {string}
 */
function swapDirection(direction) {
  switch (direction) {
    case 'U': return 'D';
    case 'D': return 'U';
    case 'L': return 'R';
    case 'R': return 'L';
  }
}

/**
 * Get Nearest Parent
 * Takes a Node, and given a key determines how many levels it needs to go to have a common parent
 * @param {Node} active_node
 * @param {string} key_to_check
 * @returns {Node}
 */
function getNearestParent(active_node, key_to_check) {
  console.log(`Getting nearest parent for keys ${active_node.key} and ${key_to_check}`);
  let active_key = active_node.key;
  let active_depth = active_key.length;
  let matching_depth = 0;
  let max_length = Math.max(key_to_check.length, active_key.length);
  for (let i = 0; i < max_length; i++) {
    if (key_to_check[i] === active_key[i]) matching_depth++;
    else break;
  }

  //Recurse up the active node to each parent to get the closest common parent
  let curr = active_node;
  console.log(`Number of parents to recurse to: ${active_depth - matching_depth}`);
  for (let j = 0; j < (active_depth - matching_depth); j++) {
    curr = curr.parent;
  }
  return curr;
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
