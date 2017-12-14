import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Header, Select, AddButton, FormItem } from '@r29/prelude';
import { compose, keys, map, not, prop, pluck, propEq } from 'ramda';
import charts from './charts';
import util from './server/util';

import './Results.css';

const toOption = v => ({ label: v, value: v });

const experimentOptions = compose(map(toOption), pluck('name'));

const statusOptions = ['on', 'off', 'resolved'].map(toOption);

const resolveOptions = compose(map(toOption), keys, prop('config'));

const controlBucket = propEq('bucket', 'control');

export default class Results extends Component {
  constructor(props) {
    super(props);

    this.state = {
      experiments: [],
      summary: [],
      selected: {
        name: '',
        status: '',
        resolved_variant: null,
        config: {}
      }
    };
  }

  componentWillMount() {
    fetch('/ab/experiments', { credentials: 'include' })
      .then(r => r.json())
      .then(r => this.setState(
        { experiments: r.result },
        () => this.handleChange(null, r.result[0].name)
      ))
      .catch(() => {});
  }

  handleChange = (_, name) =>
    fetch(`/ab/results/${name}`, { credentials: 'include' })
      .then(r => r.json())
      .then(r => this.setState(
        {
          selected: this.state.experiments.find(propEq('name', name)),
          summary: r.result.summary
        },
        charts(r.result, this.metricChart, this.distributionChart)
      ));

  submit = () =>
    fetch('/ab/update', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(this.state.selected)
    });

  control = () => this.state.summary.find(controlBucket) || {};

  variants = () => this.state.summary.filter(compose(not, controlBucket));

  improvement = variant => variant.mean / this.control().mean - 1;

  render() {
    return (
      <div className="results">
        <Header title="Dash A/B Testing" />
        <Link to="/ab/configure" className="add-button">
          <AddButton onClick={() => {}} />
        </Link>
        <FormItem label="Experiment">
          <Select
            name="experiment"
            options={experimentOptions(this.state.experiments)}
            value={this.state.selected.name}
            onChange={this.handleChange}
            clearable={false}
          />
        </FormItem>
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
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Control</td>
                  <td>{this.control().count}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                {this.variants().map(v => {
                  const improvement = this.improvement(v);
                  const confidence = util.confidence([this.control(), v]);

                  return (
                    <tr>
                      <td>{v.bucket}</td>
                      <td>{v.count}</td>
                      <td>{util.percentage(improvement)}%</td>
                      <td>{util.percentage(confidence)}%</td>
                      <td>{util.recommendation(improvement, confidence)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FormItem>
        <FormItem label="Status">
          <Select
            name="status"
            options={statusOptions}
            value={this.state.selected.status}
            onChange={(_, status) => this.setState({
              selected: { ...this.state.selected, status }
            })}
            clearable={false}
          />
        </FormItem>
        <FormItem label="Resolve to">
          <Select
            name="resolve"
            options={resolveOptions(this.state.selected)}
            value={this.state.selected.resolved_variant}
            onChange={(_, resolved_variant) => this.setState({
              selected: { ...this.state.selected, resolved_variant }
            })}
            clearable={false}
          />
        </FormItem>
        <Button onClick={this.submit}>Save Changes</Button>
      </div>
    );
  }
}
