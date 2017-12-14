const d3 = require('d3');
const { compose, prop, props, map } = require('ramda');

const margin = 20;
const width = 1040;
const height = 400;

const body = d3.select('#charts');

const container = body
  .append('svg')
    .attr('width', width + 2 * margin)
    .attr('height', height + 2 * margin)
  .append('g')
    .attr('transform', `translate(${margin}, ${margin})`);

const container2 = body
  .append('svg')
    .attr('width', width + 2 * margin)
    .attr('height', height + 2 * margin)
  .append('g')
    .attr('transform', `translate(${margin}, ${margin})`);

const lineFunction = (x, y) =>
  d3.line()
    .x(compose(x, prop('x')))
    .y(compose(y, prop('y')));

const areaFunction = y0 => (x, y) =>
  d3.area()
    .x(compose(x, prop('x')))
    .y0(y0)
    .y1(compose(y, prop('y')));

const lineData = map(d => ({ x: new Date(d.date), y: d.sum / d.count }));
const distData = d => ({ x: new Date(d.date), y: d.control / (d.control + d.variant) });

const drawLine = (data, line, color) =>
  container.append('path')
    .data([data])
    .attr('d', line)
    .attr('stroke', color)
    .attr('stroke-width', '2')
    .attr('fill', 'none');

const drawArea = (data, area, color) =>
  container2.append('path')
    .data([data])
    .attr('d', area)
    .attr('fill', color);

const drawAxes = (x, y, container) => {
  container.append('g')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat('%b-%y')));

  container.append('g').call(d3.axisLeft(y));
};

export default function charts(data) {
  // const [control, variant] = compose(map(lineData), props(['control', 'variant']))(data);
  const distribution = data.distributions.map(distData);

  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(distribution, prop('x')));

  // const y = d3.scaleLinear()
  //   .range([height, 0])
  //   .domain(d3.extent([...control, ...variant], prop('y')));

  const yDist = d3.scaleLinear().range([height, 0]).domain([0, 1]);

  drawArea(distribution, areaFunction(0)(x, yDist), 'aliceblue');
  drawArea(distribution, areaFunction(height)(x, yDist), 'lightsteelblue');

  // drawLine(control, lineFunction(x, y), 'blue');
  // drawLine(variant, lineFunction(x, y), 'green');

  // drawAxes(x, y, container);
  drawAxes(x, yDist, container2);
}
