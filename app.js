var path = require('path');
var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});