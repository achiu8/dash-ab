const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

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

app.use('/ab', express.static('build'));

app.get('/ab/:id', (req, res) => {
  connection.then(conn => {
    conn.execute(
      'select * from users where email = ?',
      ['andy.chiu@refinery29.com']
    ).then(([results]) => res.send({ results }));
  });
});

app.listen(PORT, () => console.log(`listening on port ${PORT}...`));
