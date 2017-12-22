'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var Session = mongoose.model('Session');
var User = mongoose.model('User');

/**
 * @api {post} /api/sign-in Sign in existing user
 * @apiName SignIn
 * @apiGroup Session
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 * @apiSuccess {String} registrationToken Firebase registration token
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Signed in user details
 * @apiSuccess {String} token Authentication token
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.signIn = function(req, res) {
  if (!req.body.email) return res.json({ success: false, message: 'Email is required' });
  if (!req.body.password) return res.json({ success: false, message: 'Password is required' });
  if (!req.body.registrationToken) return res.json({ success: false, message: 'Registration token is required' });
  User
  .findOne({ email: req.body.email })
  .populate([
    { path: 'preferences', select: 'name' },
    { path: 'tags', select: 'name' }
  ])
  .exec(function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'Incorrect email or password' });
    if (!user.approved) return res.json({ success: false, message: 'Account not approved yet' });
    bcrypt.compare(req.body.password, user.password, function(err, match) {
      if (err) return res.send(err);
      if (!match) return res.json({ success: false, message: 'Incorrect email or password' });
      var token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      Session.findOne({ user: user._id, registrationToken: req.body.registrationToken }, function(err, session) {
        if (err) return res.send(err);
        if (!session) {
          session = new Session({ user: user._id, token: token, registrationToken: req.body.registrationToken });
        } else {
          session.token = token;
        }
        session.save(function(err, session) {
          if (err) return res.send(err);
          res.json({ success: true, data: { user: user, token: token } });
        });
      });
    });
  });
};

/**
 * @api {post} /api/facebook-sign-in Sign in with Facebook
 * @apiName FacebookSignIn
 * @apiGroup Session
 *
 * @apiParam {String} accessToken Facebook user access token
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Signed in user details
 * @apiSuccess {String} token Authentication token
 * @apiSuccess {Array} friends Facebook friends who previously signed up
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.facebookSignIn = function(req, res) {
  if (!req.body.accessToken) return res.json({ success: false, message: 'Facebook access token is required' });
  axios
  .get(`https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture{url},gender,locale,birthday,friends.limit(5000){id}&access_token=${req.body.accessToken}`)
  .then(function(response) {
    const profile = response.data;
    if (profile.error) return res.json({ success: false, message: profile.error.message });
    const language = profile.locale.split('_')[0];
    User.findOneOrCreate({ email: profile.email }, {
      name: { first: profile.first_name, last: profile.last_name },
      email: profile.email,
      gender: profile.gender,
      birthdate: profile.birthday ? moment(new Date(profile.birthday)).format('YYYY-MM-DD') : undefined,
      language: language === 'en' || language === 'in' ? language : undefined,
      confirmed: true,
      facebook: profile.id,
      picture: profile.picture.data.url
    }, function (err, user) {
      if (err) return res.send(err);
      user.facebook = profile.id;
      user.picture = !user.picture || user.picture.indexOf('fbcdn.net') !== -1
      ? profile.picture.data.url
      : user.picture;
      user.save(function(err, user) {
        var token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        const facebookIds = profile.friends.data.map(function(friend) { return friend.id; });
        User.find({ facebook: { $in: facebookIds } }, 'name picture', function(err, users) {
          if (err) return res.send(err);
          Session.findOne({ user: user._id, registrationToken: req.body.registrationToken }, function(err, session) {
            if (err) return res.send(err);
            if (!session) {
              session = new Session({ user: req.decoded._id, token: token, registrationToken: req.body.registrationToken });
            } else {
              session.token = token;
            }
            session.save(function(err, session) {
              if (err) return res.send(err);
              res.json({ success: true, data: { user: user, friends: users, token: token } });
            });
          });
        })
      });
    });
  })
  .catch(function(err) {
    res.json({ success: false, message: err.response.data.error.message });
  })
};

/**
 * @api {delete} /api/sign-out Sign out from a single device
 * @apiName SignOut
 * @apiGroup Session
 *
 * @apiSuccess {String} token Authentication token
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.signOut = function(req, res) {
  Session.findOne({ user: req.decoded._id, token: req.body.token }, function(err, session) {
    if (err) return res.send(err);
    if (!session) return res.json({ success: false, message: 'You are already signed out' });
    session.remove(function(err, session) {
      if (err) return res.send(err);
      res.json({ success: true });
    })
  });
};