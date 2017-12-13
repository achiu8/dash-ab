const express = require('express');
const path = require('path');

const app = express();

app.get(['/ab', '/ab/configure'], (req, res) => {
  res.sendFile(path.join(__dirname + '/../../build/index.html'));
});

app.use('/ab', express.static('build'));

app.listen(9393, () => console.log('listening on port 9393...'));
