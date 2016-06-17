import {copy2DArray} from './helper';

module.exports = {
  'algorithm_solve_for_checker': solveChecker,
  'algorithm_solve_board': solveBoard
}

//Global Reference for the Solve Board Method
let stored_values = null;

/**
 * Algorithms are Generators that can be called per step to get the next value to display
 *
 * During Processing:
 * {
 *   x: 0,
 *   y: 5,
 *   value: 'X' -- X for checked, O for open - 055 - open 55 steps from freedom
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
 * Solves for a single checker location on the board
 * @param {string[][]} boardValues
 * @param {object} checkerLocation {x, y}
 * @param {number} boardSize
 */
function* solveChecker(boardValues, checkerLocation, boardSize) {
  //Make a copy of the board values so we don't muddy up the original
  let values = copy2DArray(boardValues);
  let checker = checkerLocation;
  let size = boardSize;
  let number_moves = 0;

  //Start at the checker location - show current
  yield {
    curr: {x: checker.x, y: checker.y}
  };

  //Start out by getting the current
  let current = values[checker.y][checker.x];
  let current_pos = {x: checker.x, y: checker.y};
  //Now create an infinite loop - we'll break the loop when we need to
  while (true) {
    //Create a reference to the original location so we can update it when we yield
    let old = {
      x: current_pos.x,
      y: current_pos.y
    };

    //Get the adjustment from the current position the panel indicates
    let adjustment = getMovement(current);
    //Increment Number of moves
    number_moves++;

    //Modify the Current Position by the Adjustment and get the next direction to check
    current_pos.x += adjustment.x;
    current_pos.y += adjustment.y;

    //Check to see if the next box is outside of the board
    if (current_pos.x < 0 || current_pos.x >= size || current_pos.y < 0 || current_pos.y >= size) {
      yield {
        completed: true,
        status: 'success',
        description: `Success!\nReached the border in ${number_moves} moves!`
      };
      break;
    }

    current = values[current_pos.y][current_pos.x];

    //Next check to see if this is an already checked location, if so FAIL - We're stuck in an INFINITE LEWP!
    if (current === 'X') {
      yield {
        completed: true,
        status: 'failure',
        description: `Failure!\nReaches an infinite loop starting in ${number_moves} moves!`
      };
      break;
    }

    //Otherwise lets mark the old position as X and set the next position as the C
    values[old.y][old.x] = 'X';

    //Yield the results and let the loop continue
    yield {
      x: old.x,
      y: old.y,
      value: 'X',
      curr: {x: current_pos.x, y: current_pos.y}
    };
  }
}

/**
 * Solves the entire board and then determines if the checker is on a valid exit square
 * @param {string[][]} boardValues
 * @param {object} checkerLocation {x, y}
 * @param {number} boardSize
 * @param {boolean} reset - this resets the cached board state
 */
function* solveBoard(boardValues, checkerLocation, boardSize, reset) {
  //If the board is saved and we didn't send a reset flag - use existing values and ONLY do the final check
  if (!reset && stored_values) {
    return yield finalCheck(checkerLocation, stored_values);
  }

  //Make a copy of the board values so we don't muddy up the original
  let values = copy2DArray(boardValues);
  let checker = checkerLocation;
  let size = boardSize;
  let number_of_moves = 0;

  //Location stack is a stack of all VALID squares - we use the location stack remember which squares we saw
  //that were valid and then get the next one -- array of objects { x, y }
  let location_stack = [];

  //To solve the entire board this algorithm starts at the outside and works it's way in
  //First check the entire border and add to our stack any that are bueno
  //Top Border
  for (let i = 0; i < size; i++) {
    let loc = {x: i, y: 0};
    number_of_moves++;
    yield testBorder(loc, 'U', location_stack, values);
  }

  //Right Border
  for (let i = 0; i < size; i++) {
    let loc = {x: size-1, y: i};
    number_of_moves++;
    yield testBorder(loc, 'R', location_stack, values);
  }

  //Bottom Border
  for (let i = 0; i < size; i++) {
    let loc = {x: i, y: size-1};
    number_of_moves++;
    yield testBorder(loc, 'D', location_stack, values);
  }

  //Left Border
  for (let i = 0; i < size; i++) {
    let loc = {x: 0, y: i};
    number_of_moves++;
    yield testBorder(loc, 'L', location_stack, values);
  }

  //Loop until we run out of location stack items to check (means we cleared the board)
  while (location_stack.length > 0) {
    let next_location = location_stack.pop();

    //Check the four blocks surrounding each location
    let direction_array = ['U','R','D','L'];
    for (let i = 0; i < direction_array.length; i++) {
      let result = check(next_location, direction_array[i], location_stack, values, size);
      if (result != null) {
        number_of_moves++;
        yield result;
      }
    }
  }

  //Keep a reference to stored values so that we can use the solved board if we move the checker but do not change the board
  stored_values = values;

  //FINAL YIELD - determines if checker is on a valid square
  yield finalCheck(checker, values, number_of_moves);
}

/**
 * Check a single location in a single direction
 *
 * @param {object} location {x, y} - the original location
 * @param {string} direction - the direction the original block is facing
 * @param {object[]} location_stack
 * @param {string[][]} values - board values
 * @param {number} board_sizes
 */
function check(location, direction, location_stack, values, board_size) {
  let adjustment = getMovement(direction);
  let check_location = {x: location.x + adjustment.x, y: location.y + adjustment.y };

  //If it's off the board just return null to skip
  if (check_location.x < 0 || check_location.x >= board_size || check_location.y < 0 || check_location.y >= board_size) {
    return null;
  }

  let current_value = values[location.y][location.x];
  let current_number = parseInt(current_value.slice(1));
  let check_value = values[check_location.y][check_location.x];

  //If check value starts with an O it's already checked so skip it
  if (check_value[0] === 'O') {
    return {
      curr: check_location
    };
  }

  let is_valid = false;

  //Determine if the value of the checked location points toward the original location
  switch(direction) {
    case 'U':
      if (check_value === 'D') is_valid = true;
      break;
    case 'R':
      if (check_value === 'L') is_valid = true;
      break;
    case 'D':
      if (check_value === 'U') is_valid = true;
      break;
    case 'L':
      if (check_value === 'R') is_valid = true;
      break;
  }

  //If the block points toward this location add 1 to the current number (steps until the block is free) and push the location
  //to the stack for checking
  if (is_valid) {
    current_number++;
    let updated_value = 'O' + current_number
    location_stack.push(check_location);
    values[check_location.y][check_location.x] = updated_value;
    return {
      curr: check_location,
      value: updated_value,
      x: check_location.x,
      y: check_location.y
    };
  } else {
    return {
      curr: check_location
    }
  }
}

/**
 * Tests and returns a value for each of the border locations
 *
 * If good adds it to the location stack to check
 * @param {object} loc - location to check
 * @param {string} good_value - what signifies a good value for this location
 * @param {object[]} location_stack
 * @param {string[][]} values - board values
 */
function testBorder(loc, good_value, location_stack, values) {
    let box_val = values[loc.y][loc.x];
    if (box_val === good_value) {
      location_stack.push(loc);
      values[loc.y][loc.x] = 'O1';
      return {
        curr: loc,
        value: 'O1',
        x: loc.x,
        y: loc.y
      };
    } else {
      return {
        curr: loc
      };
    }
}

/**
 * Final Check for the checker location against the board values
 * @param {object} checker - {x, y}
 * @param {string[][]} values - board values
 */
function finalCheck(checker, values, num_moves) {
  //If the first character of the location of the checker is 'O' it means this is a move that goes to the end of the board
  let checker_value = values[checker.y][checker.x];
  if (checker_value[0] === 'O') {
    //Take everything but the first character (this is hte number of moves for that location)
    let number_of_moves = parseInt(checker_value.slice(1));
    let completed_description = `Success!\nChecker will reach the border in ${number_of_moves} moves!`;
    if (num_moves) completed_description += `\n\nBoard was solved in ${num_moves} moves.`;
    return {
      completed: true,
      status: 'success',
      description:  completed_description
    };
  } else {
    let failure_description = `Failure!\nThis checker location will never reach the outside!`;
    if (num_moves) failure_description += `\n\nBoard was solved in ${num_moves} moves.`;
    return {
      completed: true,
      status: 'failure',
      description: failure_description
    };
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


