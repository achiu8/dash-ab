const d3 = require('d3');
const { compose, map, prop } = require('ramda');
const util = require('./server/util');

const margin = 40;
const width = 1000;
const height = 400;

const lineFunction = (x, y) =>
  d3.line()
    .x(compose(x, prop('x')))
    .y(compose(y, prop('y')));

const areaFunction = y0 => (x, y) =>
  d3.area()
    .x(compose(x, prop('x')))
    .y0(y0)
    .y1(compose(y, prop('y')));

const lineData = d => ({ x: new Date(d.date), y: d.sum / d.count });
const distData = d => ({ x: new Date(d.date), y: d.control / (d.control + d.variant) });

export default function charts(data, metricChart, distributionChart) {
  const container = d3.select(metricChart)
    .selectAll('svg')
      .remove()
    .append('svg')
      .attr('width', width + 2 * margin)
      .attr('height', height + 2 * margin)
    .append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

  const container2 = d3.select(distributionChart)
    .selectAll('svg')
      .remove()
    .append('svg')
      .attr('width', width + 2 * margin)
      .attr('height', height + 2 * margin)
    .append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

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
      .attr('class', 'axis')
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(d3.timeDay.every(3))
        .tickFormat(d3.timeFormat('%m-%d-%y')));

    container.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).tickFormat(d3.format('.1f')));
  };

  const { distributions, metrics } = data;

  const metricsFor = bucket => compose(map(lineData), util.zipSumCount(bucket))(metrics, distributions);

  const [control, variant] = ['control', 'variant'].map(metricsFor);
  const distribution = distributions.map(distData);

  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(distribution, prop('x')));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain(d3.extent([...control, ...variant], prop('y')));

  const yDist = d3.scaleLinear().range([height, 0]).domain([0, 1]);

  drawArea(distribution, areaFunction(0)(x, yDist), 'lightsteelblue');
  drawArea(distribution, areaFunction(height)(x, yDist), 'royalblue');

  drawLine(control, lineFunction(x, y), 'lightsteelblue');
  drawLine(variant, lineFunction(x, y), 'royalblue');

  drawAxes(x, y, container);
  drawAxes(x, yDist, container2);
}
