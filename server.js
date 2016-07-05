var express = require('express');
var app = express();
var tester = require('./private/tester');

app.use(express.static('public'));

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/index', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/test', function(req, res) {
	tester.test(req, res);
});

var server = app.listen(8080, function () {
  console.log("Server listening localhost::8080");
});