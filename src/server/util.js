const { compose, map, scan, tail, zipWith } = require('ramda');

const add = (acc, d) => Object.assign({}, d, {
  control: (acc.control || 0) + d.control,
  variant: (acc.variant || 0) + d.variant
});

const summary = key => (sums, counts) => ({
  date: sums.date,
  sum: sums[key],
  count: counts[key]
});

const parse = d => Object.assign({}, d, {
  control: parseInt(d.control),
  variant: parseInt(d.variant)
});

module.exports = {
  accumulate: compose(tail, scan(add, {}), map(parse)),
  zipSummary: key => zipWith(summary(key))
};
