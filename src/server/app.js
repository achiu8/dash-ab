const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const buildExperimentConfig = require('./buildExperimentConfig');

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
    .then(conn => conn.execute('select name from experiments'))
    .then(([result]) => res.send({ result }));
});

app.get('/ab/:id', (req, res) => {
  connection
    .then(conn =>
      conn.execute(
        'select * from users where email = ?',
        ['andy.chiu@refinery29.com']
      )
    )
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

const distributionSql = `
select
  bucketed_at as date,
  sum(case when bucket = 'control' then 1 else 0 end) as control,
  sum(case when bucket = 'auto' then 1 else 0 end) as auto
from entry_experiments
where experiment_name = ?
group by 1
`;

const metricSql = `
select
  date(ee.bucketed_at) as date,
  sum(case when ee.bucket = 'control' then 1 else 0 end) as control,
  sum(case when ee.bucket = 'auto' then 1 else 0 end) as auto
from blog_entries be
  join entry_experiments ee on be.id = ee.entry_id
  join blog_entry_tags bet on be.id = bet.entry_id
  join blog_tags bt on bt.id = bet.tag_id
where ee.experiment_name = ?
  and bt.type = 'channels'
group by 1
`;

app.get('/ab/results/:name', (req, res) => {
  const { name } = req.params;

  connection
    .then(conn => Promise.all([
      conn.execute(distributionSql, name),
      conn.execute(metricSql, name)
    ]))
    .then(([[distributions], [metrics]]) => res.send({ result: { distributions, metrics } }));
});

app.listen(PORT, () => console.log(`listening on port ${PORT}...`));
