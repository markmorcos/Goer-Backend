'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcrypt');
var multer  = require('multer');
var axios = require('axios');
var moment = require('moment');
var ses = require('node-ses');

var fs = require('../../util/fs');
var constants = require('../../util/constants');

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
  if (!req.body.email) valid = false, res.status(400).json({ success: false, message: 'Email is required' });
  User.findOne({ email: req.body.email }, function(err, user) {
    if (valid && err) valid = false, res.send(err);
    if (valid && user) valid = false, res.status(400).json({ success: false, message: 'Email is already taken' });
    if (valid && !req.body.password) {
      valid = false, res.status(400).json({ success: false, message: 'Password is required' });
    }
    switch (req.body.role) {
      case 'user':
        if (valid && !req.body.firstName) {
          valid = false, res.status(400).json({ success: false, message: 'First name is required' });
        }
        if (valid && !req.body.lastName) {
          valid = false, res.status(400).json({ success: false, message: 'Last name is required' });
        }
        break;
      case 'business':
        if (valid && !req.body.name) {
          valid = false, res.status(400).json({ success: false, message: 'Name is required' });
        }
        if (valid && !req.body.phone) {
          valid = false, res.status(400).json({ success: false, message: 'Phone is required' });
        }
        if (valid && (!req.body.latitude || !req.body.longitude)) {
          valid = false, res.status(400).json({ success: false, message: 'Location is required' });
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
    name: req.body.name || { first: req.body.firstName, last: req.body.lastName },
    location: req.body.latitude && req.body.longitude
    ? [req.body.latitude, req.body.longitude]
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
    role: req.body.role
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
 * @apiParam {Array} tags Tags (optional)
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
        User.populate(user, [{ path: 'tags', select: 'name' }], function(err, user) {
          if (err) return res.send(err);
          res.json({ success: true, data: { user: user } });
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
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.confirmed) return res.status(400).json({ success: false, message: 'User already confirmed' });
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
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!req.body.confirmation) return res.status(400).json({ success: false, message: 'Confirmation code is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.confirmed) return res.status(400).json({ success: false, message: 'User already confirmed' });
    if (req.body.confirmation !== user.confirmation) {
      return res.status(400).json({ success: false, message: 'Invalid confirmation code' });
    }
    user.confirmed = true;
    user.save(function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
}

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
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!req.body.message) return res.status(400).json({ success: false, message: 'Message is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') {
      return res.status(404).json({ success: false, message: 'Business not found' });
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
  if (!req.body.email) return res.status(400).json({ success: false, message: 'Email is required' });
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
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
 * @api {put} /api/change-password Change user password
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
  if (!req.body.password) return res.status(400).json({ success: false, message: 'Password is required' });
  const user = req.decoded;
  bcrypt.compare(req.body.password, user.password, function(err, match) {
    if (err) return res.send(err);
    if (!match) return res.status(400).json({ success: false, message: 'Incorrect password' });
    if (!req.body.newPassword) return res.status(400).json({ success: false, message: 'New password is required' });
    user.password = bcrypt.hashSync(req.body.newPassword, 10);
    user.save(function(err, user) {
      if (err) return res.send(err);
      client.sendEmail({
        to: user.email,
        from: constants.from,
        subject: 'Goer',
        message: `Your password has been changed successfully.`,
        altText: `Your password has been changed successfully.`,
      }, function(err, data, response) {
        if (err) return res.send(err);
        res.json({ success: true });
      });
    });
  });
}

/**
 * @api {get} /api/search Search users or businesses
 * @apiName ChangePassword
 * @apiGroup User
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} type Search type; people, tags and nearby
 * @apiParam {String} query Search query
 * @apiParam {Array} tags Tags (Tag IDs, tags type only)
 * @apiParam {Number} latitude Nearby location latitude (nearby type only)
 * @apiParam {Number} longitude Nearby location longitude (nearby type only)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} users Search result
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.search = function(req, res) {
  if (!req.query.type) return res.status(400).json({ success: false, message: 'Type is required' });
  let query = req.query.query
  ? {
    $or: [
      { 'name.first': { $regex: new RegExp('^.*' + req.query.query + '.*$', 'i') } },
      { 'name.last': { $regex: new RegExp('^.*' + req.query.query + '.*$', 'i') } },
      { 'fullName': { $regex: new RegExp('^.*' + req.query.query + '.*$', 'i') } }
    ]
  }
  : { /* TODO: following */ };
  const aggregate = [
    {
      $project: {
        name: true,
        picture: true,
        role: true,
        tags: true,
        distance: true,
        fullName: { $concat: ['$name.first', ' ', '$name.last'] }
      }
    },
    { $sort: { distance: 1 } }
  ];
  switch (req.query.type) {
    case 'people':
      query.role = 'user';
      break;
    case 'tags':
      if (!req.query.tags) return res.status(400).json({ success: false, message: 'Tags is required' });
      query.role = 'business';
      query.tags = { $in: req.query.tags.map(function(tag) { return mongoose.Types.ObjectId(tag); }) };
      break;
    case 'nearby':
      if (!req.query.latitude || !req.query.longitude) {
        return res.status(400).json({ success: false, message: 'Location is required' });
      }
      aggregate.unshift({
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(req.query.latitude), Number(req.query.longitude)] },
          distanceField: 'distance',
          spherical: true
        }
      });
      query.role = 'business';
      break;
    default:
      return res.status(400).json({ success: false, message: 'Type should be either people, tags or nearby' });
  }
  aggregate.push({ $match: query });
  aggregate.push({ $project: { name: true, picture: true } });
  User.aggregate(aggregate, function(err, users) {
    if (err) return res.send(err);
    res.json({ success: true, data: { users: users } });
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
 * @api {get} /api/read-profile Read user profile
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
exports.readProfile = function(req, res) {
  if (!req.query.id) return res.status(400).json({ success: false, message: 'ID is required' });
  User
  .findById(req.query.id)
  .populate([{ path: 'tags', select: 'name' }])
  .exec(function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.private) {
      return res.json({ success: true, data: { user: getPrivateUser(user.toObject()) } });
    }
    res.json({ success: true, data: { user: user } });
  });
};

exports.validateExistingUser = function(req, res, next) {
  var valid = true;
  User
  .findById(req.body.id || req.decoded._id, function(err, user) {
    if (valid && err) valid = false, res.send(err);
    if (valid && !user) valid = false, res.status(404).json({ success: false, message: 'User not found' });
    if (valid && req.decoded._id != user._id) {
      valid = false, res.status(403).json({ success: false, message: 'You are not allowed to update this user' });
    }
    if (!valid && req.file) return fs.delete(req.file.path);
    req.user = user;
    return next();
  });  
}

/**
 * @api {put} /api/update-profile Update user profile
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
exports.updateProfile = function(req, res) {
  const user = req.user;
  user.private = req.body.private || user.private;
  user.description = req.body.description || user.description;
  user.language = req.body.language || user.language;
  user.phone = req.body.phone || user.phone;
  user.name = {
    first: req.body.name || req.body.firstName || user.name.first,
    last: req.body.lastName || user.name.last
  };
  user.tags = req.body.tags === undefined ? user.tags : req.body.tags || [];      
  switch (user.role) {
    case 'business':
      user.location = req.body.latitude && req.body.longitude
      ? [req.body.latitude, req.body.longitude]
      : user.location;
      break;
    case 'user':
      user.gender = req.body.gender || user.gender;
      user.birthdate = req.body.birthdate || user.birthdate;
      user.facebook = req.body.facebook === undefined ? user.facebook : req.body.facebook;
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
    User.populate(user, [{ path: 'tags', select: 'name' }], function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true, data: { user: user } });
    });  
  });
};

exports.list = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to list users' });
  }
  User.find({ role: 'user' }, { password: false }).sort('fullName').exec(function(err, users) {
    if (err) return res.send(err);
    res.json({ success: true, data: users });
  });
};

exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to create users' });
  }
  if (!req.body.picture) return res.status(400).json({ success: false, message: 'Picture is required' });
  if (!req.body.name.first) return res.status(400).json({ success: false, message: 'First name is required' });
  if (!req.body.name.last) return res.status(400).json({ success: false, message: 'Last name is required' });
  if (!req.body.email) return res.status(400).json({ success: false, message: 'Email is required' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'Password is required' });
  if (!req.body.confirmation) return res.status(400).json({ success: false, message: 'Confirmation is required' });
  if (!req.body.approved) return res.status(400).json({ success: false, message: 'Approved is required' });
  if (!req.body.confirmed) return res.status(400).json({ success: false, message: 'Confirmed is required' });
  var user = new User({ 
    role: 'user',
    picture: req.body.picture,
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    gender: req.body.gender,
    birthdate: req.body.birthdate,
    phone: req.body.phone,
    confirmation: req.body.confirmation,
    description: req.body.description,
    language: req.body.language,
    approved: req.body.approved,
    confirmed: req.body.confirmed,
    tags: req.body.tags
  });
  user.save(function(err, user) {
    if (err) return res.send(err);
    res.json({ success: true, data: user });
  });
};

exports.read = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to read users' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  User.findById(req.params.id, { password: false }, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  });
};

exports.update = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to update this user' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  User.findById(req.params.id, function(err, user) {
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.picture = req.body.picture || user.picture;
    user.name = req.body.name || user.name;
    user.location = req.body.location || user.location;
    user.email = req.body.email || user.email;
    user.password = bcrypt.hashSync(req.body.password, 10) || user.password;
    user.phone = req.body.phone || user.phone;
    user.confirmation = req.body.confirmation || user.confirmation;
    user.description = req.body.description || user.description;
    user.language = req.body.language || user.language;
    user.approved = req.body.approved || user.approved;
    user.confirmed = req.body.confirmed || user.confirmed;
    user.tags = req.body.tags;
    user.save(function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true, data: user });
    });
  });
};

exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to delete this user' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true });
  });
};
