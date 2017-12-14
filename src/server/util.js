const ztable = require('ztable');
const { compose, map, scan, sum, tail, zipWith } = require('ramda');

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

const denom = f => compose(Math.sqrt, sum, map(f));
const count = ({ stddev, count }) => Math.pow(stddev, 2) / count;
const z = ([c, v]) => (v.mean - c.mean) / denom(count)([v, c]);

module.exports = {
  accumulate: compose(tail, scan(add, {}), map(parse)),
  zipSummary: key => zipWith(summary(key)),
  confidence: compose(ztable, z),
  percentage: x => (x * 100).toFixed(1)
};
