'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer  = require('multer');

var fs = require('../../util/fs');

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

function generateNumber(length) {
  var min = Math.pow(10, length - 1);
  var max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.validateNewUser = function(req, res, next) {
  var valid = req.body.email && req.body.password;
  if (!req.body.email) res.json({ success: false, message: 'Email is required' });
  if (!req.body.password) res.json({ success: false, message: 'Password is required' });
  switch (req.body.role) {
    case 'admin':
    case 'manager':
      break;
    case 'business':
      valid = valid && req.body.name && req.body.phone && req.body.latitude && req.body.longitude;
      if (!req.body.name) res.json({ success: false, message: 'Name is required' });
      if (!req.body.phone) res.json({ success: false, message: 'Phone is required' });
      if (!req.body.latitude || !req.body.longitude) {
        return res.json({ success: false, message: 'Location is required' });
      }
      break;
    default:
      valid = valid && req.body.firstName && req.body.lastName;
      if (!req.body.firstName) res.json({ success: false, message: 'First name is required' });
      if (!req.body.lastName) res.json({ success: false, message: 'Last name is required' });
      break;
  }
  if (valid) return next();
  fs.delete(req.file.path);    
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
    const directory = 'uploads/users/picture';
    fs.mkdir(directory);
    const ext = req.file.originalname.split('.').pop();
    const path = `${directory}/${user._id}.${ext}`;
    fs.move(req.file.path, path);
    user.picture = `http://18.221.103.200/${path}`;
    next(user);
  } else {
    next(user);
  }
}

exports.signUp = function(req, res) {
  populateUser(req, res, function(user) {
    user.save(function(err, user) {
      if (err) return res.send(err);
      // TODO send confirmation email
      res.json({ success: true, user: user });
    });
  });
};

exports.resetPassword = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'User ID is required' });  
  User.findById(req.body.id, function(err, user) {
    const newPassword = generateNumber(8);
    user.password = bcrypt.hashSync(newPassword, 10);
    user.save(function(err, user) {
      if (err) return res.send(err);
      // TODO send confirmation email
      res.json({ success: true, user: user });
    });
  });
}

exports.index = function(req, res) {
  User.find({}, function(err, users) {
    if (err) return res.send(err);
    res.json({ success: true, users: users });
  });
};

exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.json({ success: false, message: 'You are not allowed to create users' });
  }
  populateUser(req, res, function(user) {
    user.approved = true;
    user.confirmed = true;
    user.role = req.body.role;
    user.save(function(err, user) {
      if (err) return res.send(err);
      res.json({ success: true, user: true });
    });
  });
};

exports.read = function(req, res) {
  if (!req.query.id) return res.json({ success: false, message: 'User ID is required' });
  User.findById(req.query.id, function(err, user) {
    if (err) return res.send(err);
    if (!user) return res.json({ success: false, message: 'User not found' });
    if (req.decoded.role !== 'admin' && req.decoded._id != user._id) {
      return res.json({ success: false, message: 'You are not allowed to read this user' });
    }
    res.json({ success: true, user: user });
  });
};

exports.validateExistingUser = function(req, res, next) {
  var valid = req.body.id;
  if (!req.body.id) res.json({ success: false, message: 'User ID is required' });  
  User.findById(req.body.id, function(err, user) {
    valid = valid && !err && user && (req.decoded.role === 'admin' || req.decoded._id == user._id);
    if (err) res.send(err);
    if (!user) res.json({ success: false, message: 'User not found' });
    if (req.decoded.role !== 'admin' && req.decoded._id != user._id) {
      res.json({ success: false, message: 'You are not allowed to update this user' });
    }
    if (valid) {
      req.user = user;
      return next();
    }
    fs.delete(req.file.path);
  });  
}

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
    const directory = 'uploads/users/picture';
    fs.mkdir(directory);
    const ext = req.file.originalname.split('.').pop();
    const path = `${directory}/${user._id}.${ext}`;
    fs.move(req.file.path, path);
    user.picture = `http://18.221.103.200/${path}`;
  } else {
    user.picture = user.picture === undefined ? user.picture : req.body.picture;
  }
  user.save(function(err, user) {
    if (err) return res.send(err);
    res.json({ success: true, user: user });
  });
};

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
