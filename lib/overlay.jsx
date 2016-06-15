import React from 'react';

/**
 * Board Overlay controls all visualization of the algorithm and the checker location
 */
export default React.createClass({

  getInitialState() {
    return {
      checkerLocation: this.props.checkerLocation,
      boardValues: this.props.boardValues,
      squareSize: this.props.squareSize,
      active: true
    };
  },

  render() {
    let canvas_size = this.props.boardWidth;
    let style = {
      width: canvas_size,
      height: canvas_size,
      position: 'absolute',
      display: 'block'
    };
    return <canvas id="overlay" width={canvas_size} height={canvas_size} style={style}>
      </canvas>
  },
  componentDidMount() {
    this.drawCanvas();
  },
  componentDidUpdate() {
    this.state.boardValues = this.props.boardValues;
    this.state.checkerLocation = this.props.checkerLocation;
    this.state.squareSize = this.props.squareSize;
    this.drawCanvas();
  },

  drawCanvas(){
    //Draw the checker
    console.log('updating checker location: ' + JSON.stringify(this.state.checkerLocation));

    let canvas = document.getElementById('overlay');
    let context = canvas.getContext('2d');
    //Before doing anything - clear out the canvas so we can draw fresh
    clearCanvas(context, canvas);

    if (this.state.active) {
      context.fillStyle = "#F00";
      drawCircle(context, this.state.checkerLocation.x, this.state.checkerLocation.y, this.state.squareSize);
    }
  }

});

function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCircle(ctx, x, y, width) {
  console.log(`drawing a circle at ${x} and ${y} with width: ${width}`)
  ctx.beginPath();
  ctx.arc((x * width) + width/2, (y * width) + width/2, (width * .8)/2, 0, Math.PI*2, true);
  ctx.fill();
}