'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var axios = require('axios');
var moment = require('moment');
var ses = require('node-ses');

var fs = require('../util/fs');
var constants = require('../util/constants');

var client = ses.createClient({
  amazon: constants.endpoint,
  key: process.env.NODE_SES_KEY,
  secret: process.env.NODE_SES_SECRET
});

function generateNumber(length) {
  var min = Math.pow(10, length - 1);
  var max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.validateNewUser = function(req, res, next) {
  var valid = true;
  if (!req.body.email) valid = false, res.json({ success: false, message: 'Email is required' });
  User.findOne({ email: req.body.email }, function(err, user) {
    if (valid && err) valid = false, res.send(err);
    if (valid && user) valid = false, res.json({ success: false, message: 'Email is already taken' });
    if (valid && !req.body.password) {
      valid = false, res.json({ success: false, message: 'Password is required' });
    }
    switch (req.body.role) {
      case 'business':
        if (valid && !req.body.name) {
          valid = false, res.json({ success: false, message: 'Name is required' });
        }
        if (valid && !req.body.phone) {
          valid = false, res.json({ success: false, message: 'Phone is required' });
        }
        if (valid && (!req.body.latitude || !req.body.longitude)) {
          valid = false, res.json({ success: false, message: 'Location is required' });
        }
        break;
      default:
        if (valid && !req.body.firstName) {
          valid = false, res.json({ success: false, message: 'First name is required' });
        }
        if (valid && !req.body.lastName) {
          valid = false, res.json({ success: false, message: 'Last name is required' });
        }
        break;
    }
    if (!valid && req.file) fs.delete(req.file.path);
    return next();
  });
}

function populateUser(req, res, next) {
  var user = new User({
    picture: req.body.picture,
    name: { first: req.body.name || req.body.firstName, last: req.body.lastName },
    location: req.body.latitude && req.body.longitude
    ? { latitude: req.body.latitude, longitude: req.body.longitude }
    : undefined,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    gender: req.body.gender,
    birthdate: req.body.birthdate,
    phone: req.body.phone,
    confirmation: generateNumber(6),
    private: req.body.private,
    description: req.body.description,
    language: req.body.language,
    approved: req.body.role !== 'business',
    facebook: req.body.facebook
  });
  if (req.file) {
    const directory = `uploads/users/${user._id}/picture`;
    fs.mkdir(`public/${directory}`);
    const ext = req.file.originalname.split('.').pop();
    const path = `public/${directory}/0.${ext}`;
    fs.move(req.file.path, path);
    user.picture = `${constants.url}/${directory}`;
    next(user);
  } else {
    next(user);
  }
}

function sendConfirmation(user, next) {
  client.sendEmail({
    to: user.email,
    from: constants.from,
    subject: 'Goer',
    message: `Your confirmation code is ${user.confirmation}.`,
    altText: `Your confirmation code is ${user.confirmation}.`
  }, function(err, data, response) {
    next(err, data, response);
  });
}

/**
 * @api {post} /api/sign-up Sign up new user
 * @apiName SignUp
 * @apiGroup User
 *
 * @apiParam {File} picture Picture (optional)
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiParam {String} phone Phone (optional in users only)
 * @apiParam {String} description Description (optional)
 * @apiParam {String} language Language; en or ar (optional, default: en)
 * @apiParam {String} facebook (optional)
 * @apiParam {Array} preferences Preferences (optional, user only)
 * @apiParam {Array} tags Tags (optional, business only)
 * @apiParam {String} firstName User first name (user only)
 * @apiParam {String} lastName User last name (user only)
 * @apiParam {String} gender User gender; male or female (optional, default: male, user only)
 * @apiParam {Boolean} private Private; true or false (optional, default: false, user only)
 * @apiParam {String} birthdate User birthdate (user only)
 * @apiParam {String} name Business name (business only)
 * @apiParam {Object} location Business location; latitude and longitude (business only)
 * @apiParam {String} role Role; user or business (optional, default: user)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Signed up user details
 * @apiSuccess {String} token Authentication token
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.signUp = function(req, res) {
  populateUser(req, res, function(user) {
    user.save(function(err, user) {
      if (err) return res.send(err);
      sendConfirmation(user, function(err, data, response) {
        if (err) return res.send(err);
        User.populate(user, [
          { path: 'preferences', select: 'name' },
          { path: 'tags', select: 'name' },
        ], function(err, user) {
          if (err) return res.send(err);
          res.json({ success: true, user: user });
        });
      });
    });
  });
};

/**
 * @api {post} /api/resend-confirmation Resend confirmation code to new user
 * @apiName ResendConfirmation
 * @apiGroup User
 *
 * @apiParam {String} id User ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.resendConfirmation = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'User not found' });
    if (user.confirmed) return res.json({ success: false, message: 'User already confirmed' });
    sendConfirmation(user, function(err, data, response) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
}

/**
 * @api {post} /api/confirm-user Confirm new user
 * @apiName ConfirmUser
 * @apiGroup User
 *
 * @apiParam {String} id User ID
 * @apiParam {String} confirmation Confirmation code
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.confirmUser = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.confirmation) return res.json({ success: false, message: 'Confirmation code is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'User not found' });
    if (user.confirmed) return res.json({ success: false, message: 'User already confirmed' });
    if (req.body.confirmation !== user.confirmation) {
      return res.json({ success: false, message: 'Invalid confirmation code' });
    }
    user.confirmed = true;
    user.save(function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
}

/**
 * @api {post} /api/sign-in Sign in existing user
 * @apiName SignIn
 * @apiGroup User
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
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
      var token = jwt.sign(user.toObject(), process.env.JWT_SECRET);
      res.json({ success: true, user: user, token: token });
    });
  });
};

/**
 * @api {post} /api/facebook-sign-in Sign in with Facebook
 * @apiName FacebookSignIn
 * @apiGroup User
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
        var token = jwt.sign(user.toObject(), process.env.JWT_SECRET);
        const facebookIds = profile.friends.data.map(function(friend) { return friend.id; });
        User.find({ facebook: { $in: facebookIds } }, 'name picture', function(err, users) {
          if (err) return res.send(err);
          res.json({ success: true, user: user, token: token, friends: users });
        })
      });
    });
  })
  .catch(function(err) {
    res.json({ success: false, message: err.response.data.error.message });
  })
};

/**
 * @api {post} /api/contact-business Contact business by email
 * @apiName ContactBusiness
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID
 * @apiParam {String} message User message
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.contactBusiness = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.message) return res.json({ success: false, message: 'Message is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') {
      return res.json({ success: false, message: 'Business not found' });
    }
    client.sendEmail({
      to: user.email,
      from: constants.from,
      subject: 'Goer',
      message: `Message from ${req.decoded.name.first} ${req.decoded.name.last}<br>
      <strong>Email</strong>: <a href="mailto:${req.decoded.email}">${req.decoded.email}</a><br>
      <strong>Message</strong>:<br>${req.body.message.replace(/(?:\r\n|\r|\n)/g, '<br>')}`,
      altText: `Message from ${req.decoded.name.first} ${req.decoded.name.last}
Email: ${req.decoded.email}
Message:
${req.body.message}`,
    }, function(err, data, response) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
}

/**
 * @api {post} /api/reset-password Reset user password by email
 * @apiName ResetPassword
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} email User email
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.resetPassword = function(req, res) {
  if (!req.body.email) return res.json({ success: false, message: 'Email is required' });
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) return res.json({ success: false, message: 'User not found' });
    const newPassword = String(generateNumber(8));
    user.password = bcrypt.hashSync(newPassword, 10);
    user.save(function(err, user) {
      if (err) return res.send(err);
      client.sendEmail({
        to: user.email,
        from: constants.from,
        subject: 'Goer',
        message: `Your new password is ${newPassword}.`,
        altText: `Your new password is ${newPassword}.`,
      }, function(err, data, response) {
        if (err) return res.send(err);
        res.json({ success: true });
      });
    });
  });
}

/**
 * @api {post} /api/change-password Change user password
 * @apiName ChangePassword
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} password User current password
 * @apiParam {String} newPassword User new password
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.changePassword = function(req, res) {
  if (!req.body.password) return res.json({ success: false, message: 'Password is required' });
  bcrypt.compare(req.body.password, req.decoded.password, function(err, match) {
    if (err) return res.send(err);
    if (!match) return res.json({ success: false, message: 'Incorrect password' });
    if (!req.body.newPassword) return res.json({ success: false, message: 'New password is required' });
    req.decoded.password = bcrypt.hashSync(newPassword, 10);
    req.decoded.save(function(err, user) {
      if (err) return res.send(err);
      client.sendEmail({
        to: req.decoded.email,
        from: constants.from,
        subject: 'Goer',
        message: `Your new password is ${newPassword}.`,
        altText: `Your new password is ${newPassword}.`,
      }, function(err, data, response) {
        if (err) return res.send(err);
        res.json({ success: true });
      });
    });
  });
}

exports.list = function(req, res) {
  User.find({}).sort([['name.first', 1], ['name.last', 1]]).exec(function(err, users) {
    if (err) return res.send(err);
    res.json({ success: true, users: users });
  });
};

function getPrivateUser(user) {
  const keys = ['picture', 'name', 'email'];
  const newUser = {};
  keys.forEach(function(key) {
    newUser[key] = user[key];
  });
  return newUser;
}

/**
 * @api {get} /api/user Read user profile
 * @apiName ReadUser
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user User details
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.read = function(req, res) {
  if (!req.query.id) return res.json({ success: false, message: 'ID is required' });
  User
  .findById(req.query.id)
  .populate([
    { path: 'preferences', select: 'name' },
    { path: 'tags', select: 'name' }
  ])
  .exec(function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'User not found' });
    if (user.private) {
      return res.json({ success: true, user: getPrivateUser(user.toObject()) });
    }
    res.json({ success: true, user: user });
  });
};

exports.validateExistingUser = function(req, res, next) {
  var valid = true;
  User
  .findById(req.body.id || req.decoded._id, function(err, user) {
    if (valid && err) valid = false, res.send(err);
    if (valid && !user) valid = false, res.json({ success: false, message: 'User not found' });
    if (valid && req.decoded._id != user._id) {
      valid = false, res.json({ success: false, message: 'You are not allowed to update this user' });
    }
    if (!valid && req.file) return fs.delete(req.file.path);
    req.user = user;
    return next();
  });  
}

/**
 * @api {put} /api/user Update existing user
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID (optional, default: signed in user ID)
 * @apiParam {File} picture Picture (optional)
 * @apiParam {String} phone Phone (optional)
 * @apiParam {String} description Description (optional)
 * @apiParam {String} language Language; en or ar (optional, default: en)
 * @apiParam {String} facebook (optional)
 * @apiParam {Array} preferences Preferences (optional, user only)
 * @apiParam {Array} tags Tags (optional, business only)
 * @apiParam {String} firstName User first name (optional, user only)
 * @apiParam {String} lastName User last name (optional, user only)
 * @apiParam {String} gender User gender; male or female (optional, default: male, user only)
 * @apiParam {Boolean} private Private; true or false (optional, default: false, user only)
 * @apiParam {String} birthdate User birthdate (optional, user only)
 * @apiParam {String} name Business name (optional, business only)
 * @apiParam {Object} location Business location; latitude and longitude (optional, business only)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Updated user details
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  const user = req.user;
  user.private = req.body.private || user.private;
  user.description = req.body.description || user.description;
  user.language = req.body.language || user.language;
  user.phone = req.body.phone || user.phone;
  user.name = {
    first: req.body.name || req.body.firstName || user.name.first,
    last: req.body.lastName || user.name.last
  };
  switch (user.role) {
    case 'business':
      user.location = req.body.latitude && req.body.longitude
      ? { latitude: req.body.latitude, longitude: req.body.longitude }
      : user.location;
      user.tags = req.body.tags === undefined ? user.tags : req.body.tags || [];      
      break;
    case 'user':
      user.gender = req.body.gender || user.gender;
      user.birthdate = req.body.birthdate || user.birthdate;
      user.facebook = req.body.facebook === undefined ? user.facebook : req.body.facebook;
      user.preferences = req.body.preferences === undefined ? user.preferences : req.body.preferences || [];      
      break;
    default:
      break;
  }
  if (req.file) {
    const directory = `uploads/users/${user._id}/picture`;
    fs.mkdir(`public/${directory}`);
    const ext = req.file.originalname.split('.').pop();
    const path = `public/${directory}/0.${ext}`;
    fs.move(req.file.path, path);
    user.picture = `${constants.url}/${directory}`;
  } else {
    user.picture = user.picture === undefined ? user.picture : req.body.picture;
  }
  user.save(function(err, user) {
    if (err) return res.send(err);
    User.populate(user, [
      { path: 'preferences', select: 'name' },
      { path: 'tags', select: 'name' }
    ], function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true, user: user });
    });  
  });
};
