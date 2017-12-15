import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { assoc, adjust, identity } from 'ramda';
import {
  Button,
  FormGroup,
  FormItem,
  Header,
  NotificationBar,
  Select,
  TextInput
} from '@r29/prelude';

import './Configure.css';

class Configure extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      metric: '',
      variants: [{ name: 'control', weight: 100 }],
      errors: []
    };
  }

  handleChange = (key, value) => this.setState({ [key]: value });

  handleVariantChange = (type, f = identity) => i => value =>
    this.setState({ variants: adjust(assoc(type, f(value)), i, this.state.variants) });

  handleVariantNameChange = this.handleVariantChange('name');

  handleVariantWeightChange = this.handleVariantChange('weight', parseInt);

  handleAddVariant = () =>
    this.setState({ variants: [...this.state.variants, { name: '', weight: '' }] });

  submit = () =>
    fetch('/ab', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(this.state)
    })
      .then(res =>
        res.status === 200
          ? this.backToResults()
          : this.setState({ errors: [{
            id: 'save-error',
            text: 'Something went wrong.',
            type: 'error',
            dismissable: true
          }]})
      );

  backToResults = () =>
    this.props.history.push('/ab');

  render() {
    return (
      <div>
        <Header
          title="Configure New Experiment"
          backLink={{ label: 'Results', href: '/ab' }}
          onBackClick={this.backToResults}
        />
        <FormItem label="Experiment Name">
          <TextInput
            name="name"
            value={this.state.name}
            onChange={this.handleChange}
          />
        </FormItem>
        <FormItem label="Bucket By">
          <Select
            name="dimension"
            options={[{ label: 'entry', value: 'entry' }]}
            value={this.state.dimension}
            onChange={this.handleChange}
            clearable={false}
          />
        </FormItem>
        <FormItem label="Evaluation Metric">
          <Select
            name="metric"
            options={[{ label: 'channels', value: 'channels' }]}
            value={this.state.metric}
            onChange={this.handleChange}
            clearable={false}
          />
        </FormItem>
        <FormGroup title="Variants">
          {this.state.variants.map((variant, i) => (
            <FormItem key={i} label={variant.name === 'control' ? 'Control' : `Variant ${i}`}>
              <input
                type="text"
                className="TextInput variant-col"
                value={variant.name}
                onChange={e => variant.name !== 'control' && this.handleVariantNameChange(i)(e.target.value)}
              />
              <input
                type="text"
                className="TextInput variant-col"
                value={variant.weight}
                onChange={e => this.handleVariantWeightChange(i)(e.target.value)}
              />
            </FormItem>
          ))}
          <Button onClick={this.handleAddVariant}>Add Variant</Button>
        </FormGroup>
        <Button onClick={this.submit}>Save Experiment</Button>
        <NotificationBar
          messages={this.state.errors}
          onDismiss={() => this.setState({ errors: [] })}
          withoutNav
        />
      </div>
    );
  }
}

export default withRouter(Configure);
