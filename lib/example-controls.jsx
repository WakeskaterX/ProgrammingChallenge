import React from 'react';
//this syntax is called object destructing.
import {Button, ButtonToolbar} from 'react-bootstrap'

export default React.createClass({
    getInitialState() {
        return {
            size: this.props.control.state.size,
            algorithm: 'algorithm_1',
            step_rate: 10
        };
    },

    render() {
        return <ButtonToolbar>
            <Button bsStyle="success" onClick={this.onPlay}>Run</Button> Algorithm:
            <select name="select_algorithm" id="select_algorithm" onChange={this.updateLocalAlgorithm}>
                <option value="algorithm_1">Algorithm 1</option>
                <option value="algorithm_solve_board">Solve Entire Board</option>
            </select> With time per step (ms):
            <input type="number" min="0" max="100" defaultValue="10" onChange={this.updateLocalStepRate}/>
            <Button bsStyle="danger" onClick={this.onStop}>Stop</Button><br/>
            <Button bsStyle="primary" onClick={this.onReset}>Reset Checker Position</Button>
            <label htmlFor="boardSize">Board Size: </label>
            <input id="boardSize" type="number" onChange={this.updateLocalSize} />
            <Button onClick={this.onSetSize}>Update & Refresh Board</Button>
        </ButtonToolbar>
    },

    updateLocalSize(e) {
        this.state.size = e.target.value;
    },

    updateLocalStepRate(e) {
        this.state.step_rate = e.target.value;
    },

    updateLocalAlgorithm(e) {
        this.state.algorithm = e.target.value;
    },

    onSetSize() {
        this.props.control.setSize(this.state.size);
    },

    onPlay() {
        this.props.control.play(this.state.algorithm, this.state.step_rate);
    },


    onStop() {
        this.props.control.stop();
    },


    onReset() {
        this.props.control.reset();
    }
});