var path = require('path');
var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/sdtt.html'))
})

app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/test.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});