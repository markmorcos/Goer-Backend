var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcrypt');

exports.list = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to list businesss' });
  }
  User.find({ role: 'business' }, { password: false }).sort('fullName').exec(function(err, businesss) {
    if (err) return res.send(err);
    res.json({ success: true, data: businesss });
  });
};

exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to create businesss' });
  }
  if (!req.body.picture) return res.status(400).json({ success: false, message: 'Picture is required' });
  if (!req.body.name) return res.status(400).json({ success: false, message: 'Name is required' });
  if (!req.body.location) return res.status(400).json({ success: false, message: 'Location is required' });
  if (!req.body.email) return res.status(400).json({ success: false, message: 'Email is required' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'Password is required' });
  if (!req.body.phone) return res.status(400).json({ success: false, message: 'Phone is required' });
  if (!req.body.confirmation) return res.status(400).json({ success: false, message: 'Confirmation is required' });
  if (!req.body.approved) return res.status(400).json({ success: false, message: 'Approved is required' });
  if (!req.body.confirmed) return res.status(400).json({ success: false, message: 'Confirmed is required' });
  var business = new User({ 
    role: 'business',
    picture: req.body.picture,
    name: req.body.name,
    location: req.body.location,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    confirmation: req.body.confirmation,
    description: req.body.description,
    language: req.body.language,
    approved: req.body.approved,
    confirmed: req.body.confirmed,
    tags: req.body.tags
  });
  business.save(function(err, business) {
    if (err) return res.send(err);
    res.json({ success: true, data: business });
  });
};

exports.read = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to read businesss' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }
  User.findById(req.params.id, { password: false }, function(err, business) {
    if (err) return res.send(err);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    res.json({ success: true, data: business });
  });
};

exports.update = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to update this business' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }
  User.findById(req.params.id, function(err, business) {
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    business.picture = req.body.picture || business.picture;
    business.name = req.body.name || business.name;
    business.location = req.body.location || business.location;
    business.email = req.body.email || business.email;
    business.password = bcrypt.hashSync(req.body.password, 10) || business.password;
    business.phone = req.body.phone || business.phone;
    business.confirmation = req.body.confirmation || business.confirmation;
    business.description = req.body.description || business.description;
    business.language = req.body.language || business.language;
    business.approved = req.body.approved || business.approved;
    business.confirmed = req.body.confirmed || business.confirmed;
    business.tags = req.body.tags;
    business.save(function(err, business) {
      if (err) return res.send(err);
      res.json({ success: true, data: business });
    });
  });
};

exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to delete this business' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }
  User.findByIdAndRemove(req.params.id, function(err, business) {
    if (err) return res.send(err);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    res.json({ success: true });
  });
};
