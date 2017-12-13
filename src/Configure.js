import React, { Component } from 'react';
import { Button, Header, FormGroup, FormItem, TextInput } from '@r29/prelude';
import { assoc, adjust } from 'ramda';

import './Configure.css';

export default class Configure extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      variants: [{ name: 'control', weight: 100 }]
    };
  }

  handleNameChange = (_, value) =>
    this.setState({ name: value });

  handleVariantChange = type => i => value =>
    this.setState({ variants: adjust(assoc(type, value), i, this.state.variants) });

  handleVariantNameChange = this.handleVariantChange('name');

  handleVariantWeightChange = this.handleVariantChange('weight');

  handleAddVariant = () =>
    this.setState({ variants: [...this.state.variants, { name: '', weight: '' }] });

  submit = () =>
    fetch('/ab', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    })

  render() {
    return (
      <div>
        <Header title="Configure" />
        <FormItem label="Experiment Name">
          <TextInput
            name="name"
            value={this.state.name}
            onChange={this.handleNameChange}
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
      </div>
    );
  }
}
