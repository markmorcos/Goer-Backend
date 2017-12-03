var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var app = express();
var port = process.env.PORT;
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/goer', { useMongoClient: true });

app.use(express.static('public'));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.post('/deploy', function (req, res) {
  spawn('sh', ['./public/deploy.sh']);
  res.json({ success: true });
});

routes = require('./routes');
routes(app);

app.use(function(req, res) {
  return res.status(404).send({ error: req.method + ' ' + req.originalUrl + ' not found' })
});

app.listen(port);
console.log('RESTful API server started on: ' + port);
