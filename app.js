var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/sdtt.html'))
})

app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/test.html'));
});

app.get('/sdtt/tests', function (req, res) {
    let tests = [];
    fs.readdir('public/shex/tests', (err, files) => {
        files.forEach((file, idx) => {
            let test = {id: idx, link: `shex/tests/${file}`}
            tests.push(test);
        });
        res.json(tests);
    })

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});