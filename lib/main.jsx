//all import statements must go at the top of the file.
import React from 'react';
import Board from './board';
import Controls from './controls';

//get the content DOMElemet create in index.html
let content = document.getElementById('content');

//This is a React class. It's main methods are 'getInitialState', and 'render'.
let Main = React.createClass({

    getInitialState() {
        return {
            size: this.props.size,
            squareSize: this.props.squareSize,
            boardValues: generateBoard(this.props.size),
            checkerLocation: {x: 0, y: 0},
            boardWidth: this.props.boardWidth
        };
    },

    render() {
        return (
            <div id="game">
                <Controls control={this}/>
                <Board size={this.state.size} squareSize={this.state.squareSize} boardValues={this.state.boardValues} checkerLocation={this.state.checkerLocation} ref={'board'}/>
            </div>
        );
    },

    /**
     * Play the Game
     * Creates the checker and initializes to a location and begins render of the board overlay
     * @param {string} algorithm_name
     */
    play(algorithm_name, step_rate) {
        //Render on the Overlay & Start the Selected Algorithm
        console.log(`Running ${algorithm_name} as the Algorithm with ${step_rate}ms between each step!`);
        this.refs.board.load(algorithm_name, step_rate, this.state.checkerLocation, this.state.boardValues);
    },

    stop() {
        this.refs.board.stop();
    },

    reset() {
        this.state.checkerLocation = generateChecker(this.state.size);
        this.refs.board.stop();
        this.setState(this.state);
    },

    setSize(value) {
        //Set the Size of the Board, the Values for the Board (generate new) and a fresh Checker Location
        this.state.size = parseInt(value, 10);
        this.state.boardValues = generateBoard(this.state.size);
        this.state.checkerLocation = generateChecker(this.state.size);
        this.state.boardWidth = this.state.size * this.state.squareSize;
        this.setState(this.state);

    }
});

/**
 * Generate Board
 * @param {number} size
 * @returns {string[][]}
 */
function generateBoard(size) {
    //Generate a 2 Dimensinal Array of strings representing the direction of the block
    var result = [];
    for (let i = 0; i < size; i++) {
        let second_array = [];
        for (let j = 0; j < size; j++) {
            second_array.push(getRandomDirection());
        }
        result.push(second_array);
    }
    return result;
}

/**
 * Generates a random checker location
 * @param {number} size
 * @returns {object} checker.x - checker.y
 */
function generateChecker(size) {
    return {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size)
    }
}

/**
 * Returns a random direction character
 * Having a 1 in 4 chance of each
 * @returns {string}
 */
function getRandomDirection() {
    var directions = ['U', 'R', 'D', 'L'];
    return directions[Math.floor(Math.random() * 4)];
}

/**
 * Render to the Virtual Dom - Main Entry Point
 */
React.render(<Main squareSize={80} size={5} boardWidth={400}/>, content, () => {
    console.log("Rendered!");
});
