'use strict';

var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

/**
 * @api {get} /api/list-tags Read all tags
 * @apiName ReadTags
 * @apiGroup Tag
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} data List of tags
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.listTags = function(req, res) {
  Tag.find({}).sort('name').exec(function(err, tags) {
    if (err) return res.send(err);
    res.json({ success: true, data: tags });
  });
};

exports.list = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to create tags' });
  }
  Tag.find({}).sort('name').exec(function(err, tags) {
    if (err) return res.send(err);
    res.json({ success: true, data: tags });
  });
};

exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to list tags' });
  }
  if (!req.body.name) return res.status(400).json({ success: false, message: 'Name is required' });
  var tag = new Tag({ name: req.body.name });
  tag.save(function(err, tag) {
    if (err) return res.send(err);
    res.json({ success: true, data: tag });
  });
};

exports.read = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to read tags' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Tag not found' });
  }
  Tag.findById(req.params.id, function(err, tag) {
    if (err) return res.send(err);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.json({ success: true, data: tag });
  });
};

exports.update = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to update this tag' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Tag not found' });
  }
  Tag.findById(req.params.id, function(err, tag) {
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    tag.name = req.body.name || tag.name;
    tag.save(function(err, tag) {
      if (err) return res.send(err);
      res.json({ success: true, data: tag });
    });
  });
};

exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.stats(403).json({ success: false, message: 'You are not allowed to delete this tag' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Tag not found' });
  }
  Tag.findByIdAndRemove(req.params.id, function(err, tag) {
    if (err) return res.send(err);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.json({ success: true });
  });
};
