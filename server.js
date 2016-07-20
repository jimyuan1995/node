var express = require('express');
var app = express();
var tester = require('./private/tester');
var printer = require('./private/printer');

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

app.get('/json/test.json', function (req, res) {
	res.sendFile('/Users/YUAN/Desktop/nodejs/public/json/test.json');
});

app.get('/print_test', function(req, res) {
	printer.print("/Users/YUAN/Desktop/nodejs/public/json/test.json", req.query.data);
});

app.get('/print_drawn', function(req, res) {
	printer.print("/Users/YUAN/Desktop/nodejs/public/json/drawn.json", req.query.data);
});	

var server = app.listen(8888, function () {
  console.log("NodeJS listening localhost:8888");
});

