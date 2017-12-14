import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header, Select } from '@r29/prelude';
import { pluck } from 'ramda';

const options = values =>
  values.map(v => ({ label: v, value: v }));

export default class Results extends Component {
  constructor(props) {
    super(props);

    this.state = {
      experiments: []
    };
  }

  componentWillMount() {
    fetch('/ab/experiments', { credentials: 'include' })
      .then(r => r.json())
      .then(r => this.setState(
        { experiments: pluck('name', r.result) },
        () => this.handleChange(null, r.result[0].name)
      ));
  }

  handleChange = (_, value) =>
    fetch(`/ab/results/${value}`, { credentials: 'include' })
      .then(r => r.json())
      .then(r => this.setState({ selected: value, data: r.result }));

  render() {
    return (
      <div>
        <Header title="Dash A/B Testing" />
        <Link to="/ab/configure">Configure New Experiment</Link>
        <Select
          name="experiment"
          options={options(this.state.experiments)}
          value={this.state.selected}
          onChange={this.handleChange}
          clearable={false}
        />
      </div>
    );
  }
}
