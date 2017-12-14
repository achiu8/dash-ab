const { compose, scan } = require('ramda');

const add = (acc, d) => Object.assign({}, d, {
  control: acc.control + d.control,
  variant: acc.variant + d.variant
});

const parse = d => Object.assign({}, d, {
  control: parseInt(d.control),
  variant: parseInt(d.variant)
});

module.exports = {
  accumulate: compose(scan(add), map(parse))
};
