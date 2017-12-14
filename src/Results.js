import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header, Select, AddButton } from '@r29/prelude';
import { pluck } from 'ramda';
import charts from './charts';

import './Results.css';

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
      ))
      .catch(() => {});
  }

  handleChange = (_, value) =>
    fetch(`/ab/results/${value}`, { credentials: 'include' })
      .then(r => r.json())
      .then(r => this.setState({ selected: value }, charts(r.result)));

  render() {
    return (
      <div className="results">
        <Header title="Dash A/B Testing" />
        <Link to="/ab/configure" className="add-button">
          <AddButton onClick={() => {}} />
        </Link>
        <Select
          name="experiment"
          options={options(this.state.experiments)}
          value={this.state.selected}
          onChange={this.handleChange}
          clearable={false}
        />
        <div id="charts" />
      </div>
    );
  }
}
