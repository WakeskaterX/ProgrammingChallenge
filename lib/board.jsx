import React from 'react';
import Square from './square'
import BoardOverlay from './overlay'
import {remote} from 'electron'

export default React.createClass({
    getInitialState() {
        return {
            size: this.props.size,
            boardValues: this.props.boardValues,
            checkerLocation: this.props.checkerLocation
        };
    },

    render() {
        //this example just creates a row of squares. Use CSS styling to
        //get the checkers into a mxm size board
        this.state.size = this.props.size;
        this.state.boardValues = this.props.boardValues;
        this.state.checkerLocation = this.props.checkerLocation;

        //set the max size to the smaller of either the height or width of the screen less 20px for the buttons
        let window_size = remote.getCurrentWindow().getSize();
        let max_width = Math.min(window_size[0], window_size[1] - 160);
        let min_square_size = 12;

        this.state.squareSize = Math.max(Math.floor(max_width / this.props.size), min_square_size);

        //create a new array of squares
        let squares = [];
        let key = 0;
        for(let i = 0; i < this.state.size; i++) {
            for(let j = 0; j < this.state.size; j++) {
                let color = (j + i % 2) % 2 == 0 ? '#333333' : '#BBBBBB';
                let direction = this.state.boardValues[i][j];
                squares.push(<Square key={++key} size={this.state.squareSize} color={color} direction={direction}></Square>)
            }
        }
        let size = this.state.boardWidth = this.state.squareSize * this.state.size;
        let style = {
            width: size,
            height: size,
            margin: 'auto'
        };

        return <div style={style}>
            {squares}
            <BoardOverlay squareSize={this.state.squareSize} size={this.state.size} boardValues={this.state.boardValues} boardWidth={this.state.boardWidth} checkerLocation={this.state.checkerLocation} ref={'overlay'}/>
        </div>;
    },

    //These Functions just pass on the request to the overlay
    load(algorithm_name, steps, checker_location, board_values) {
        this.refs.overlay.loadAlgorithm(algorithm_name, steps, checker_location, board_values);
    },

    run() {
        this.refs.overlay.run();
    },

    pause() {
        this.refs.overlay.pause();
    },

    stop() {
        this.refs.overlay.stop();
    }
});