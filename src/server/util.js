const ztable = require('ztable');
const { always, compose, cond, map, scan, sum, T, tail, zipWith } = require('ramda');

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
  control: parseInt(d.control, 10),
  variant: parseInt(d.variant, 10)
});

const denom = f => compose(Math.sqrt, sum, map(f));
const count = ({ stddev, count }) => Math.pow(stddev, 2) / count;
const z = ([c, v]) => (v.mean - c.mean) / denom(count)([v, c]);

const threshold = 0.05;

const recommendation = cond([
  [(d, c) => d >= threshold && c >= 1 - threshold, always('Resolve to Variant')],
  [(d, c) => d < 0 && c <= threshold,              always('Resolve to Control')],
  [T =>                                            always('Keep Running')]
]);

module.exports = {
  accumulate: compose(tail, scan(add, {}), map(parse)),
  zipSummary: key => zipWith(summary(key)),
  confidence: compose(ztable, z),
  percentage: x => (x * 100).toFixed(1),
  recommendation
};
