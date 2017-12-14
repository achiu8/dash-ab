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

app.get('/ab/:id', (req, res) => {
  connection
    .then(conn =>
      conn.execute(
        'select * from users where email = ?',
        ['andy.chiu@refinery29.com']
      )
    )
    .then(([results]) => res.send({ results }));
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
    .catch(err => res.send(err));
});

app.listen(PORT, () => console.log(`listening on port ${PORT}...`));
