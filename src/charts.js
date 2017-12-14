const d3 = require('d3');
const { legendColor } = require('d3-svg-legend');
const { compose, equals, filter, map, not, pluck, prepend, prop } = require('ramda');
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

const ordinal = buckets =>
  d3.scaleOrdinal()
    .domain(buckets)
    .range(['lightsteelblue', 'royalblue']);

const scale = compose(
  ordinal,
  prepend('control'),
  filter(compose(not, equals('control'))),
  pluck('bucket')
);

const lineData = d => ({ x: new Date(d.date), y: d.sum / d.count });
const distData = d => ({ x: new Date(d.date), y: d.control / (d.control + d.variant) });

export default function charts(data, metricChart, distributionChart) {
  const metricContainer = d3.select(metricChart);
  const distributionContainer = d3.select(distributionChart);

  metricContainer.selectAll('svg').remove();
  distributionContainer.selectAll('svg').remove();

  const container = metricContainer
    .append('svg')
      .attr('width', width + 2 * margin)
      .attr('height', height + 2 * margin)
    .append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

  const container2 = distributionContainer
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

  const { distributions, metrics, summary } = data;

  const drawLegend = container =>
    container.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${(width + 2 * margin) / 2 - 50} , 20)`)
      .call(legendColor()
        .shapeWidth(50)
        .shapeHeight(5)
        .orient('horizontal')
        .scale(scale(summary)));

  const metricsFor = bucket => compose(map(lineData), util.zipSummary(bucket))(metrics, distributions);

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

  drawLegend(metricContainer);
  drawLegend(distributionContainer);
}
