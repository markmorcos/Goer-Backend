'use strict';

var mongoose = require('mongoose');
var Feedback = mongoose.model('Feedback');

/**
 * @api {post} /api/send-feedback Send feedback
 * @apiName ReadFeedbacks
 * @apiGroup Feedback
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} text Feedback text
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} data List of feedbacks
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.sendFeedback = function(req, res) {
  if (!req.body.text) res.status(400).json({ success: false, message: 'Text is required' });
  Feedback.create({ user: req.decoded._id, text: req.body.text }, function(err, feedback) {
    if (err) return res.send(err);
    res.json({ success: true });
  });
};

exports.list = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to create feedbacks' });
  }
  Feedback.find({}).sort('user.name').exec(function(err, feedbacks) {
    if (err) return res.send(err);
    res.json({ success: true, data: feedbacks });
  });
};

exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to list feedbacks' });
  }
  if (!req.body.user) return res.status(400).json({ success: false, message: 'User is required' });
  if (!req.body.text) return res.status(400).json({ success: false, message: 'Text is required' });
  var feedback = new Feedback({ user: req.body.user, text: req.body.text });
  feedback.save(function(err, feedback) {
    if (err) return res.send(err);
    res.json({ success: true, data: feedback });
  });
};

exports.read = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to read feedbacks' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }
  Feedback.findById(req.params.id, function(err, feedback) {
    if (err) return res.send(err);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: feedback });
  });
};

exports.update = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to update this feedback' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }
  Feedback.findById(req.params.id, function(err, feedback) {
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    feedback.user = req.body.user || feedback.user;
    feedback.text = req.body.text || feedback.text;
    feedback.save(function(err, feedback) {
    if (err) return res.send(err);
      res.json({ success: true, data: feedback });
    });
  });
};

exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.stats(403).json({ success: false, message: 'You are not allowed to delete this feedback' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }
  Feedback.findByIdAndRemove(req.params.id, function(err, feedback) {
    if (err) return res.send(err);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true });
  });
};
