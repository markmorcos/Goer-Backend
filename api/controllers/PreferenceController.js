'use strict';

var mongoose = require('mongoose');
var Preference = mongoose.model('Preference');

exports.index = function(req, res) {
  Preference.find({}).sort('name').exec(function(err, preference) {
    if (err) return res.send(err);
    res.json({ success: true, preference: preference });
  });
};

exports.create = function(req, res) {
  if (req.decoded.role !== 'admin' && req.decoded.role !== 'manager') {
    return res.json({ success: false, message: 'You are not allowed to create preferences' });
  }
  if (!req.body.name) return res.json({ success: false, message: 'Name is required' });
  var preference = new Preference({ name: req.body.name });
  preference.save(function(err, preference) {
    if (err) return res.send(err);
    res.json({ success: true, preference: preference });
  });
};

exports.update = function(req, res) {
  if (req.decoded.role !== 'admin' && req.decoded.role !== 'manager') {
    return res.json({ success: false, message: 'You are not allowed to update this preference' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Preference.findById(req.body.id, function(err, preference) {
    if (!preference) return res.json({ success: false, message: 'Preference not found' });
    preference.name = req.body.name || preference.name;
    preference.save(function(err, preference) {
      if (err) return res.send(err);
      res.json({ success: true, preference: preference });
    });
  });
};

exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin' && req.decoded.role !== 'manager') {
    return res.json({ success: false, message: 'You are not allowed to delete this preference' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Preference.findByIdAndRemove(req.body.id, function(err, preference) {
    if (err) return res.send(err);
    if (!preference) return res.json({ success: false, message: 'Preference not found' });
    res.json({ success: true });
  });
};
