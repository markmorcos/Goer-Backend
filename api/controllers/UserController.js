'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var axios = require('axios');
var moment = require('moment');

var fs = require('../util/fs');
var constants = require('../util/constants');

function sendEmail(to, subject, html, text, next) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'mark.yehia@gmail.com',
      pass: 'Ntldrdll2971993,'
    }
  });
  var mailOptions = {
    from: 'mark.yehia@gmail.com',
    to: to,
    subject: subject,
    html: html,
    text: text
  };
  transporter.sendMail(mailOptions, function(error, info) {
    next(error, info);
  });
}

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
      case 'admin':
      case 'manager':
        break;
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
    if (valid) return next();
    if (req.file) fs.delete(req.file.path);
  });
}

function populateUser(req, res, next) {
  var user = new User({
    picture: req.body.picture,
    name: req.body.name,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
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
    facebook: req.body.facebook,
    instagram: req.body.instagram
  });
  if (req.file) {
    const directory = `uploads/users/${user._id}/picture`;
    fs.mkdir(`public/${directory}`);
    const ext = req.file.originalname.split('.').pop();
    const path = `public/${directory}/0.${ext}`;
    fs.move(req.file.path, path);
    user.picture = `${constants.url}${path}`;
    next(user);
  } else {
    next(user);
  }
}

function sendConfirmation(user, next) {
  sendEmail(
    user.email,
    'Goer',
    `Your confirmation code is ${user.confirmation}.`,
    `Your confirmation code is ${user.confirmation}.`,
    function (err, info) {
      next(err, info);
    }
  );
}

/**
 * @api {post} /api/sign-up Sign up new user
 * @apiName SignUp
 * @apiGroup User
 *
 * @apiParam {File} picture picture (Optional)
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiParam {String} phone Phone (Optional in users only)
 * @apiParam {String} description Description (Optional)
 * @apiParam {String} language Language; en or ar (Optional, default: en)
 * @apiParam {String} facebook (Optional)
 * @apiParam {String} instagram (Optional)
 * @apiParam {String} firstName User first name (user only)
 * @apiParam {String} lastName User last name (user only)
 * @apiParam {String} gender User gender; male or female (Optional, default: male, user only)
 * @apiParam {Boolean} private Private; true or false (Optional, default: false, user only)
 * @apiParam {String} birthdate User birthdate (user only)
 * @apiParam {String} name Business name (business only)
 * @apiParam {Object} location Business location; latitude and longitude (business only)
 * @apiParam {String} role Role; user, business, manager or admin (Optional, default: user)
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
      sendConfirmation(user, function(err, info) {
        if (err) return res.send(err);
        res.json({ success: true, user: user });
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
    sendConfirmation(user, function(err, info) {
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
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'Incorrect email or password' });
    if (!user.confirmed) return res.json({ success: false, message: 'Account not confirmed yet' });
    if (!user.approved) return res.json({ success: false, message: 'Account not approved yet' });
    bcrypt.compare(req.body.password, user.password, function(err, match) {
      if (!match) return res.json({ success: false, message: 'Incorrect email or password' });
      if (err) return res.send(err);
      var token = jwt.sign(user.toObject(), 'secret');
      res.json({ success: true, user: user, token: token });
    });
  });
};

/**
 * @api {post} /api/facebook-sign-in Sign in existing user
 * @apiName FacebookSignIn
 * @apiGroup User
 *
 * @apiParam {String} accessToken Facebook user access token
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Signed in user details
 * @apiSuccess {String} token Authentication token
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.facebookSignIn = function(req, res) {
  if (!req.body.accessToken) return res.json({ success: false, message: 'Facebook access token is required' });
  axios
  .get(`https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture{url},gender,locale,birthday&access_token=${req.body.accessToken}`)
  .then(function(response) {
    if (response.data.error) return res.json({ success: false, message: response.data.error.message });
    const language = response.data.locale.split('_')[0];
    User.findOneOrCreate({ email: response.data.email }, {
      firstName: response.data.first_name,
      lastName: response.data.last_name,
      email: response.data.email,
      gender: response.data.gender,
      birthdate: moment(new Date(response.data.birthday)).format('YYYY-MM-DD'),
      confirmation: generateNumber(6),
      language: language === 'en' || language === 'in' ? language : undefined,
      confirmed: true,
      facebook: response.data.id,
      picture: response.data.picture.url
    }, function (err, user) {
      if (err) return res.send(err);
      user.facebook = response.data.id;
      user.save(function(err, user) {
        var token = jwt.sign(user.toObject(), 'secret');
        res.json({ success: true, user: user, token: token });
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
    sendEmail(
      user.email,
      'Goer',
      `Message from ${req.decoded.firstName} ${req.decoded.lastName}<br>
      Email: ${req.decoded.email}<br>
      Message: ${req.body.message}`,
      `Message from ${req.decoded.firstName} ${req.decoded.lastName}
Email: ${req.decoded.email}
Message: ${req.body.message}`,
      function (err, info) {
        if (err) return res.send(err);
        res.json({ success: true });
      }
    );
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
      sendEmail(
        user.email,
        'Goer',
        `Your new password is ${newPassword}.`,
        `Your new password is ${newPassword}.`,
        function (err, info) {
          if (err) return res.send(err);
          var token = jwt.sign(user.toObject(), 'secret');
          res.json({ success: true });
        }
      );
    });
  });
}

exports.index = function(req, res) {
  User.find({}, function(err, users) {
    if (err) return res.send(err);
    res.json({ success: true, users: users });
  });
};

/**
 * @api {post} /api/user Create new user (Admin only)
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {File} picture picture (Optional)
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiParam {String} phone Phone (Optional in users only)
 * @apiParam {String} description Description (Optional)
 * @apiParam {String} language Language; en or ar (Optional, default: en)
 * @apiParam {String} facebook (Optional)
 * @apiParam {String} instagram (Optional)
 * @apiParam {String} firstName User first name (user only)
 * @apiParam {String} lastName User last name (user only)
 * @apiParam {String} gender User gender; male or female (Optional, default: male, user only)
 * @apiParam {Boolean} private Private; true or false (Optional, default: false, user only)
 * @apiParam {String} birthdate User birthdate (user only)
 * @apiParam {String} name Business name (business only)
 * @apiParam {Object} location Business location; latitude and longitude (business only)
 * @apiParam {String} role Role; user, business, manager or admin (Optional, default: user)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Signed up user details
 * @apiSuccess {String} token Authentication token
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.json({ success: false, message: 'You are not allowed to create users' });
  }
  populateUser(req, res, function(user) {
    user.confirmed = true;
    user.role = req.body.role || 'user';
    user.save(function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true, user: true });
    });
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
  if (!req.query.id) return res.json({ success: false, message: 'User ID is required' });
  User.findById(req.query.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'User not found' });
    if (req.decoded.role !== 'admin' && user.private) {
      return res.json({ success: true, user: getPrivateUser(user.toObject()) });
    }
    res.json({ success: true, user: user });
  });
};

exports.validateExistingUser = function(req, res, next) {
  var valid = true;
  User.findById(req.body.id || req.decoded._id, function(err, user) {
    if (valid && err) valid = false, res.send(err);
    if (valid && !user) valid = false, res.json({ success: false, message: 'User not found' });
    if (valid && req.decoded.role !== 'admin' && req.decoded._id != user._id) {
      valid = false, res.json({ success: false, message: 'You are not allowed to update this user' });
    }
    if (valid) {
      req.user = user;
      return next();
    }
    if (req.file) fs.delete(req.file.path);
  });  
}

/**
 * @api {put} /api/user Update existing user
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID (Optional, default: signed in user ID)
 * @apiParam {File} picture picture (Optional)
 * @apiParam {String} email Email (Optional)
 * @apiParam {String} password Password (Optional)
 * @apiParam {String} phone Phone (Optional)
 * @apiParam {String} description Description (Optional)
 * @apiParam {String} language Language; en or ar (Optional, default: en)
 * @apiParam {String} facebook (Optional)
 * @apiParam {String} instagram (Optional)
 * @apiParam {String} firstName User first name (Optional, user only)
 * @apiParam {String} lastName User last name (Optional, user only)
 * @apiParam {String} gender User gender; male or female (Optional, default: male, user only)
 * @apiParam {Boolean} private Private; true or false (Optional, default: false, user only)
 * @apiParam {String} birthdate User birthdate (Optional, user only)
 * @apiParam {String} name Business name (Optional, business only)
 * @apiParam {Object} location Business location; latitude and longitude (Optional, business only)
 * @apiParam {String} role Role; user, business, manager or admin (Optional, default: user)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Updated user details
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  const user = req.user;
  if (req.decoded.role === 'admin') {
    user.approved = req.body.approved || user.approved;
  }
  user.email = req.body.email || user.email;
  user.password = req.body.password ? bcrypt.hashSync(req.body.password, 10) : user.password;
  user.private = req.body.private || user.private;
  user.description = req.body.description || user.description;
  user.language = req.body.language || user.language;
  user.phone = req.body.phone || user.phone;
  switch (user.role) {
    case 'admin':
      break;
    case 'manager':
      break;
    case 'business':
      user.name = req.body.name || user.name;
      user.location = req.body.latitude && req.body.longitude
      ? { latitude: req.body.latitude, longitude: req.body.longitude }
      : user.location;
      user.tags = req.body.tags || [];      
      break;
    case 'user':
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.gender = req.body.gender || user.gender;
      user.birthdate = req.body.birthdate || user.birthdate;
      user.facebook = req.body.facebook === undefined ? user.facebook : req.body.facebook;
      user.instagram = req.body.instagram === undefined ? user.instagram : req.body.facebook;
      user.preferences = req.body.preferences || [];
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
    user.picture = `${constants.url}${path}`;
  } else {
    user.picture = user.picture === undefined ? user.picture : req.body.picture;
  }
  user.save(function(err, user) {
    if (err) return res.send(err);
    res.json({ success: true, user: user });
  });
};

/**
 * @api {delete} /api/user Delete existing user (Admin only)
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin' || req.decoded._id == req.body.id) {
    return res.json({ success: false, message: 'You are not allowed to delete this user' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'User ID is required' });
  User.findByIdAndRemove(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'User not found' });
    fs.delete(user.picture);
    res.json({ success: true });
  });
};
