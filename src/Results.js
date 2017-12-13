import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@r29/prelude';

export default class Results extends Component {
  render() {
    return (
      <div>
        <Header title="Dash A/B Testing" />
        <Link to="/ab/configure">Configure New Experiment</Link>
      </div>
    );
  }
}
