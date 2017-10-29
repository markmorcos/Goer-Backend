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
var upload = multer({ dest: './uploads' });

var User = require('./api/models/User');
var Preference = require('./api/models/Preference');
var Follow = require('./api/models/Follow');

var users = require('./api/controllers/UserController');
var preferences = require('./api/controllers/PreferenceController');
var follows = require('./api/controllers/FollowController');

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
        req.decoded = decoded;
        next();
  		}
  	});
  } else {
  	return res.json({ success: false, message: 'Authentication failed' });
  }
}

app.post(
  '/sign-up',
  upload.single('picture'),
  users.validateNewUser,
  users.signUp
);
app.post('/sign-in', users.signIn);
app.get('/profile', verifyToken, users.read);
app.put(
  '/profile',
  upload.single('picture'),
  verifyToken,
  users.validateExistingUser,
  users.update
);
app.post('/reset-password', verifyToken, users.resetPassword);

app.post('/user', upload.single('picture'), verifyToken, users.create);
app.get('/user', verifyToken, users.read);
app.get('/users', users.index);
app.put('/user',
  upload.single('picture'),
  verifyToken,
  users.validateExistingUser,
  users.update
);
app.delete('/user', verifyToken, users.delete);

app.get('/preferences', preferences.index);
app.post('/preference', verifyToken, preferences.create);
app.put('/preference', verifyToken, preferences.update);
app.delete('/preference', verifyToken, preferences.delete);

app.get('/follows', verifyToken, follows.list);
app.post('/follow', verifyToken, follows.follow);
app.put('/accept', verifyToken, follows.accept);
app.delete('/reject', verifyToken, follows.reject);
app.delete('/delete', verifyToken, follows.delete);

app.use('/uploads', express.static('uploads'));

app.use(function(req, res) {
  return res.status(404).send({ error: req.originalUrl + ' not found' })
});

app.listen(port);

console.log('RESTful API server started on: ' + port);
