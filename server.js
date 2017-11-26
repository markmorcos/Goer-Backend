var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var app = express();
var port = process.env.PORT;
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var exec = require('child_process').exec;

var User = require('./api/models/User');
var Save = require('./api/models/Save');
var Preference = require('./api/models/Preference');
var Tag = require('./api/models/Tag');
var Follow = require('./api/models/Follow');
var Post = require('./api/models/Post');
var Reaction = require('./api/models/Reaction');
var Notification = require('./api/models/Notification');
var Static = require('./api/models/Static');

var users = require('./api/controllers/UserController');
var saves = require('./api/controllers/SaveController');
var preferences = require('./api/controllers/PreferenceController');
var tags = require('./api/controllers/TagController');
var follows = require('./api/controllers/FollowController');
var posts = require('./api/controllers/PostController');
var reactions = require('./api/controllers/ReactionController');
var notifications = require('./api/controllers/NotificationController');
var statics = require('./api/controllers/StaticController');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));
var upload = multer({ dest: './public/uploads' });
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/goer', { useMongoClient: true });

function verifyToken(req, res, next) {
  var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'];
  if (!token) return res.json({ success: false, message: 'Authentication failed' });
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) return res.json({ success: false, message: 'Authentication failed' });
    User.findById(decoded._id, function(err, user) {
      if (err) return res.send(err);
      if (!user) return res.json({ success: false, message: 'Authentication failed' });
      req.decoded = user;
      next();
    });
  });
}

function verifyOptionalToken(req, res, next) {
  var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'];
  if (!token) return next();
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) return next();
    User.findById(decoded._id, function(err, user) {
      if (err) return res.send(err);
      if (!user) return next();
      req.decoded = user;
      next();
    });
  });
}

app.use(express.static('public'));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.post('/deploy', function (req, res) {
  var deploy = exec('sh', ['./public/deploy.sh']);
  res.json({ success: true });
});

// User
app.post( '/api/sign-up', upload.single('picture'), users.validateNewUser, users.signUp);
app.post('/api/resend-confirmation', users.resendConfirmation);
app.post('/api/confirm-user', users.confirmUser);
app.post('/api/sign-in', users.signIn);
app.post('/api/facebook-sign-in', users.facebookSignIn);
app.post('/api/contact-business', verifyToken, users.contactBusiness);
app.post('/api/reset-password', users.resetPassword);

app.get('/api/user', verifyToken, users.read);
app.get('/api/users', users.list);
app.put('/api/user', upload.single('picture'), verifyToken, users.validateExistingUser, users.update);

// Save
app.get('/api/saves', verifyToken, saves.list);
app.post('/api/save', verifyToken, saves.create);
app.delete('/api/save', verifyToken, saves.delete);

// Preference
app.get('/api/preferences', preferences.list);
app.post('/api/preference', verifyToken, preferences.create);
app.put('/api/preference', verifyToken, preferences.update);
app.delete('/api/preference', verifyToken, preferences.delete);

// Tag
app.get('/api/tags', tags.list);
app.post('/api/tag', verifyToken, tags.create);
app.put('/api/tag', verifyToken, tags.update);
app.delete('/api/tag', verifyToken, tags.delete);

// Follow
app.get('/api/follows', verifyToken, follows.list);
app.post('/api/follow', verifyToken, follows.follow);
app.put('/api/accept', verifyToken, follows.accept);
app.delete('/api/reject', verifyToken, follows.reject);
app.delete('/api/unfollow', verifyToken, follows.delete);

// Post
app.get('/api/feed', verifyToken, posts.feed);
app.get('/api/posts', verifyToken, posts.list);
app.post('/api/post', upload.array('pictures'), verifyToken, posts.validateNewPost, posts.create);
app.get('/api/post', verifyToken, posts.read);
app.put('/api/post', upload.array('pictures'), verifyToken, posts.validateExistingPost, posts.update);
app.delete('/api/post', verifyToken, posts.delete);

// Post
app.post('/api/reaction', verifyToken, reactions.create);
app.put('/api/reaction', verifyToken, reactions.update);
app.delete('/api/reaction', verifyToken, reactions.delete);

// Notification
app.get('/api/notifications', verifyToken, notifications.list);

// Static
app.get('/api/statics', statics.list);

app.use(function(req, res) {
  return res.status(404).send({ error: req.method + ' ' + req.originalUrl + ' not found' })
});

app.listen(port);

console.log('RESTful API server started on: ' + port);
