var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var morgan = require('morgan');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost/goer', { useMongoClient: true });
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var upload = multer({ dest: './public/uploads' });
var exec = require('child_process').exec;

var User = require('./api/models/User');
var Preference = require('./api/models/Preference');
var Follow = require('./api/models/Follow');
var Notification = require('./api/models/Notification');

var users = require('./api/controllers/UserController');
var preferences = require('./api/controllers/PreferenceController');
var follows = require('./api/controllers/FollowController');
var notifications = require('./api/controllers/NotificationController');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

function verifyToken(req, res, next) {
  var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'];
  if (token) {
  	jwt.verify(token, 'secret', function(err, decoded) {
  		if (err) {
        return res.json({ success: false, message: 'Authentication failed' });
  		} else {
        User.findById(decoded._id, function(err, user) {
          if (err) return res.send(err);
          if (!user) return res.json({ success: false, message: 'Authentication failed' });      
          req.decoded = decoded;
          next();
        });
  		}
  	});
  } else {
  	return res.json({ success: false, message: 'Authentication failed' });
  }
}
app.use(express.static('public'));

app.get('/deploy', function(req, res) {
  exec('./public/deploy.sh', function(err, stdout, stderr) {
    if (err) return res.send(err);
    if (stderr) return res.send(stderr);
    res.send(stdout);
  });
});

// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

app.post(
  '/api/sign-up',
  upload.single('picture'),
  users.validateNewUser,
  users.signUp
);
app.post('/api/resend-confirmation', users.resendConfirmation);
app.post('/api/confirm-user', users.confirmUser);
app.post('/api/sign-in', users.signIn);
app.post('/api/contact-business', verifyToken, users.contactBusiness);
app.post('/api/reset-password', users.resetPassword);

app.post('/api/user', upload.single('picture'), verifyToken, users.validateNewUser, users.create);
app.get('/api/user', verifyToken, users.read);
app.get('/api/users', users.index);
app.put('/api/user',
  upload.single('picture'),
  verifyToken,
  users.validateExistingUser,
  users.update
);
app.delete('/api/user', verifyToken, users.delete);

app.get('/api/preferences', preferences.list);
app.post('/api/preference', verifyToken, preferences.create);
app.put('/api/preference', verifyToken, preferences.update);
app.delete('/api/preference', verifyToken, preferences.delete);

app.get('/api/follows', verifyToken, follows.list);
app.post('/api/follow', verifyToken, follows.follow);
app.put('/api/accept', verifyToken, follows.accept);
app.delete('/api/reject', verifyToken, follows.reject);
app.delete('/api/unfollow', verifyToken, follows.delete);

app.get('/api/notifications', verifyToken, notifications.list);

app.use(function(req, res) {
  return res.status(404).send({ error: req.originalUrl + ' not found' })
});

app.listen(port);

console.log('RESTful API server started on: ' + port);
