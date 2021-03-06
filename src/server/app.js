const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const buildExperimentConfig = require('./buildExperimentConfig');
const buildBuckets = require('./buildBuckets');
const buildConfigs = require('./buildConfigs');
const sql = require('./sql');
const util = require('./util');

const PORT = process.env.PORT || 9393;
const {
  MYSQL_HOST,
  MYSQL_DB,
  MYSQL_USER,
  MYSQL_PASSWORD
} = process.env;

const app = express();

const connection = mysql.createConnection({
  host: MYSQL_HOST,
  database: MYSQL_DB,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD
});

app.use(bodyParser.json())

app.use('/ab', express.static('build'));

app.get('/ab/experiments', (req, res) => {
  connection
    .then(conn => conn.execute('select * from experiments'))
    .then(([result]) => res.send({ result }));
});

app.post('/ab', (req, res) => {
  const { name, variants } = req.body;
  const config = buildExperimentConfig(variants);

  connection
    .then(conn =>
      conn.execute(
        'insert into experiments (name, status, config) values (?, ?, ?)',
        [name, 'off', JSON.stringify(config)]
      )
    )
    .then(() => res.send('success'))
    .catch(err => res.status(500).send(err));
});

app.post('/ab/update', (req, res) => {
  const { name, status, resolved_variant } = req.body;

  connection
    .then(conn =>
      conn.execute(
        'update experiments set status = ?, resolved_variant = ? where name = ?',
        [status, resolved_variant, name]
      )
    )
    .then(() => res.send('success'))
    .catch(err => res.status(500).send(err));
});


app.get('/ab/results/:name', (req, res) => {
  const { name } = req.params;

  connection
    .then(conn => Promise.all([
      conn.execute(sql.distributions, [name]),
      conn.execute(sql.metrics, [name]),
      conn.execute(sql.summary, [name, name, name]),
    ]))
    .then(([[distributions], [metrics], [summary]]) => res.send({ result: {
      distributions: util.accumulate(distributions),
      metrics: util.accumulate(metrics),
      summary
    }}));
});

app.get('/ab/buckets/:entryId', (req, res) => {
  connection
    .then(conn => Promise.all([
      conn.execute(
        'select experiment_name as name, bucket from entry_experiments where entry_id = ?',
        [req.params.entryId]
      ),
      conn.execute('select * from experiments')
    ]))
    .then(([[experiments], [configs]]) => res.send({ result: {
      buckets: buildBuckets(experiments),
      config: buildConfigs(configs)
    }}));
});

app.post('/ab/buckets', (req, res) => {
  const { id, name, bucket } = req.body;

  connection
    .then(conn =>
      conn.execute(
        'insert into entry_experiments (entry_id, experiment_name, bucket) values (?, ?, ?)',
        [id, name, bucket]
      )
    )
    .then(() => res.send('success'))
    .catch(err => res.status(500).send(err));
});

app.listen(PORT, () => console.log(`listening on port ${PORT}...`));
