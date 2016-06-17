import React from 'react';
import algorithms from './algorithms';
import {copy2DArray, arrayIsEqual2D} from './helper';

/**
 * Enum for various states of the overlay / algorithm processor
 *
 * @enum {string}
 */
let STATE = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  PAUSED: 'paused',
  WAITING: 'waiting',
  FINISHED: 'finished'
}
/**
 * Board Overlay controls all visualization of the algorithm and the checker location
 */
export default React.createClass({

  /**
   * Set up the initial State
   */
  getInitialState() {
    return {
      algorithmName: '',
      checkerLocation: this.props.checkerLocation,
      currentLoc: {x: 0, y: 0},
      boardValues: this.props.boardValues,
      squareSize: this.props.squareSize,
      size: this.props.size,
      solveState: STATE.WAITING,
      shouldReset: false,
      currentTimeout: null,
      audio_gong: new Audio('./audio/gong.mp3')
    };
  },

  /**
   * Render the Canvas Overlay
   */
  render() {
    let canvas_size = this.props.boardWidth;
    let style = {
      width: canvas_size,
      height: canvas_size,
      position: 'absolute',
      display: 'block'
    };
    return (
      <canvas id="overlay" width={canvas_size} height={canvas_size} style={style}>
      </canvas>
    )
  },

  /**
   * Draw the Canvas once the component is mounted
   */
  componentDidMount() {
    this.drawCanvas();
  },

  /**
   * If the component updated - check to see if we should reset certain values
   * Update the board size, square size, etc.
   * And then draw the canvas
   */
  componentDidUpdate(prevProps) {
    this.state.size = this.props.size;

    //Reset the board if updated
    if (!arrayIsEqual2D(prevProps.boardValues, this.props.boardValues)) {
      this.state.shouldReset = true;
      //Make a copy of the array so we don't mutate the original when we make multiple runs
      this.state.boardValues = copy2DArray(this.props.boardValues);
    }

    this.state.checkerLocation = this.props.checkerLocation;
    this.state.squareSize = this.props.squareSize;

    //If we updated some of the values - set the state to inactive - wait for a play request
    this.state.solveState = STATE.WAITING;
    this.drawCanvas();
  },

  /**
   * Draw the Overlay - the overlay consists of drawing updated board states (O,X)
   * and the checker and the current location
   */
  drawCanvas(){
    //Draw the checker
    let canvas = document.getElementById('overlay');
    let context = canvas.getContext('2d');
    let boardSize = this.state.size;
    let x_color = "rgba(255, 0, 0, .5)";
    let o_color = "rgba(0, 255, 255, .5)";
    //Before doing anything - clear out the canvas so we can draw fresh
    clearCanvas(context, canvas);

    //Draw if the state is not inactive
    if (this.state.solveState !== STATE.INACTIVE) {
      context.fillStyle = "#F00";
      drawCircle(context, this.state.checkerLocation.x, this.state.checkerLocation.y, this.state.squareSize);

      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (this.state.boardValues[i][j][0] === 'O') {
            drawRect(context, j, i, this.state.squareSize, o_color);
          }
          if (this.state.boardValues[i][j] === 'X') {
            drawRect(context, j, i, this.state.squareSize, x_color);
          }
        }
      }

      if (this.state.solveState === STATE.ACTIVE) {
        drawCurrent(context, this.state.currentLoc.x, this.state.currentLoc.y, this.state.squareSize);
      }
    }
  },

  /**
   * Loads an algorithm by name, setting the step time, checker location and board values
   * @param {string} algorithm_name
   * @param {number} step_time - time in ms between each action
   * @param {object} checker_location {x,y}
   * @param {string[][]} board_values
   */
  loadAlgorithm(algorithm_name, step_time, checker_location, board_values) {
    //Stop all activities first before restarting
    this.stop();
    //If values changed or we changed the algorithm (or if the algorithm is solve for checker)
    //make a copy of the values each time we load an algorithm so we clear what we currently have set
    if (arrayIsEqual2D(this.state.boardValues, board_values) || (this.state.algorithmName !== algorithm_name) || algorithm_name === "algorithm_solve_for_checker") {
      this.state.boardValues = copy2DArray(board_values);
      this.state.algorithmName = algorithm_name;
    }

    //Update the checker location, step_time, algorithm generator and solveState
    this.state.checkerLocation = checker_location;
    this.state.step_time = step_time;
    this.state.algorithm = algorithms[algorithm_name](this.state.boardValues, this.state.checkerLocation, this.state.size, this.state.shouldReset);
    this.state.solveState = STATE.ACTIVE;
    this.run();
  },

  /**
   * Run - performs a single step and redraws the overlay or finishes
   */
  run() {
    //Get the result back from the algorithm
    let result = this.state.algorithm.next().value;

    if (result.completed) {
      //Finish
      this.finish(result);
      return;
    } else {
      //Set the State of the value (X or O#) if value is set
      if (result.value) {
        this.state.boardValues[result.y][result.x] = result.value;
      }

      //Set the current location being checked with curr.x and curr.y
      this.state.currentLoc = result.curr;
    }
    this.drawCanvas();

    if (this.state.solveState === STATE.ACTIVE) {
      this.state.currentTimeout = setTimeout(this.run, this.state.step_time);
    }
  },

  /**
   * Stops the currently running algorithm
   */
  stop() {
    //Clear any current timeouts so we don't activate the next step
    if (this.state.currentTimeout) clearTimeout(this.state.currentTimeout);
    this.state.solveState = STATE.INACTIVE;
  },

  /**
   * Finishes and alerts the result to the user
   * @param {object} result {description, completed, status}
   */
  finish(result) {
    this.state.audio_gong.play();
    window.alert(result.description);
    //If we successfully finished - we should not reset the board
    this.setState({
      solveState: STATE.FINISHED,
      shouldReset: false
    });
  }
});


/**
 * DRAW FUNCTIONS
 */
/**
 * Clears the Canvas
 * @param {2DContext} ctx
 * @param {Canvas} canvas
 */
function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draws a circle on the context
 * @param {2DContext} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 */
function drawCircle(ctx, x, y, width) {
  ctx.beginPath();
  ctx.arc((x * width) + width/2, (y * width) + width/2, (width * .8)/2, 0, Math.PI*2, true);
  ctx.fill();
}

/**
 * Draws a filled rectangle
 * @param {2DContext} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {string} color - fill style
 */
function drawRect(ctx, x, y, width, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(x * width, y * width, width, width);
  ctx.fill();
}

/**
 * Draws the currently viewed location
 */
function drawCurrent(ctx, x, y, width) {
  ctx.beginPath();
  ctx.strokeStyle = "rgba(0, 255, 0, 1)";
  ctx.lineWidth = width/20;
  ctx.rect(x * width, y * width, width, width);
  ctx.rect(x * width + (width/10), y * width + (width/10), width * (4/5), width * (4/5));
  ctx.stroke();
}