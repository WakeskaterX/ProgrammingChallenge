import React from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap'

export default React.createClass({
    getInitialState() {
        return {
            size: this.props.control.state.size,
            algorithm: 'algorithm_solve_for_checker',
            step_rate: 500,
            audio_click: new Audio('./audio/click.mp3')
        };
    },

    render() {
        return <ButtonToolbar>
            <Button bsStyle="success" onClick={this.onPlay}>Run</Button>&nbsp;&nbsp;&nbsp;Algorithm:
            <select name="select_algorithm" id="select_algorithm" onChange={this.updateLocalAlgorithm}>
                <option value="algorithm_solve_for_checker">Solve For Checker</option>
            </select> With time per step (ms):
            <input type="number" min="0" max="5000" defaultValue="500" onChange={this.updateLocalStepRate}/>
            <Button id="stop" bsStyle="danger" onClick={this.onStop}>Stop</Button><br/>
            <Button bsStyle="primary" onClick={this.onReset}>Reset Checker Position</Button>
            <label htmlFor="boardSize">Board Size: </label>
            <input id="boardSize" type="number" onChange={this.updateLocalSize} />
            <Button onClick={this.onSetSize}>Update & Refresh Board</Button>
        </ButtonToolbar>
    },

    /**
     * Updates the size of the board when the value in the input is changed
     */
    updateLocalSize(e) {
        this.state.size = e.target.value;
    },

    /**
     * updates the local step rate of the algorithm when the input is changed
     */
    updateLocalStepRate(e) {
        this.state.step_rate = e.target.value;
    },

    /**
     * Updates the local algorithm name when selected
     */
    updateLocalAlgorithm(e) {
        this.state.algorithm = e.target.value;
    },

    /**
     * Sets the size of the board
     */
    onSetSize() {
        this.state.audio_click.play();
        this.props.control.setSize(this.state.size);
    },

    /**
     * Runs the currently selected algorithm and step rate
     */
    onPlay() {
        this.state.audio_click.play();
        this.props.control.play(this.state.algorithm, this.state.step_rate);
    },

    /**
     * Stops the currently running visualization
     */
    onStop() {
        this.state.audio_click.play();
        this.props.control.stop();
    },

    /**
     * Resets the checker position (but not the board state)
     */
    onReset() {
        this.state.audio_click.play();
        this.props.control.reset();
    }
});