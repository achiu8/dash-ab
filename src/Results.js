import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header, Select, AddButton, FormItem } from '@r29/prelude';
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
      .then(r => this.setState(
        { selected: value },
        charts(r.result, this.metricChart, this.distributionChart)
      ));

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
        <FormItem label="Cumulative Average Channel Tags per Story">
          <div ref={node => this.metricChart = node} />
        </FormItem>
        <FormItem label="Cumulative Bucket Distribution">
          <div ref={node => this.distributionChart = node} />
        </FormItem>
        <FormItem label="Summary">
          <div className="summary-container">
            <table className="summary">
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th>Sample Size</th>
                  <th>Percentage Improvement</th>
                  <th>Chance to Beat Control</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Control</td>
                  <td>123</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Variant</td>
                  <td>125</td>
                  <td>5.6%</td>
                  <td>96.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </FormItem>
      </div>
    );
  }
}
