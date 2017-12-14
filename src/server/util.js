const { compose, map, scan } = require('ramda');

const add = (acc, d) => Object.assign({}, d, {
  control: (acc.control || 0) + d.control,
  variant: (acc.variant || 0) + d.variant
});

const parse = d => Object.assign({}, d, {
  control: parseInt(d.control),
  variant: parseInt(d.variant)
});

module.exports = {
  accumulate: compose(scan(add, {}), map(parse))
};
