import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header, Select, AddButton, FormItem } from '@r29/prelude';
import { compose, not, pluck, propEq } from 'ramda';
import charts from './charts';
import util from './server/util';

import './Results.css';

const options = values =>
  values.map(v => ({ label: v, value: v }));

const controlBucket = propEq('bucket', 'control');

export default class Results extends Component {
  constructor(props) {
    super(props);

    this.state = {
      experiments: [],
      summary: []
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
        { selected: value, summary: r.result.summary },
        charts(r.result, this.metricChart, this.distributionChart)
      ));

  control = () =>
    this.state.summary.find(controlBucket);

  variants = () =>
    this.state.summary.filter(compose(not, controlBucket));

  improvement = variant =>
    variant.mean / this.control().mean - 1;

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
                  <td>{this.control().count}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                {this.variants().map(v => (
                  <tr>
                    <td>{v.bucket}</td>
                    <td>{v.count}</td>
                    <td>{compose(util.percentage, this.improvement)(v)}%</td>
                    <td>{compose(util.percentage, util.confidence)([this.control(), v])}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormItem>
      </div>
    );
  }
}
