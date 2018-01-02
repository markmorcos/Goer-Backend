'use strict';

var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

/**
 * @api {get} /api/tags Read all tags
 * @apiName ReadTags
 * @apiGroup Tag
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} data List of tags
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  Tag.find({}).sort('name').exec(function(err, tags) {
    if (err) return res.send(err);
    res.json({ success: true, data: tags });
  });
};

/**
 * @api {post} /api/tag Create new tag (Admin only)
 * @apiName CreateTag
 * @apiGroup Tag
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} name Tag name
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} data Tag created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to create tags' });
  }
  if (!req.body.name) return res.status(400).json({ success: false, message: 'Name is required' });
  var tag = new Tag({ name: req.body.name });
  tag.save(function(err, tag) {
    if (err) return res.send(err);
    res.json({ success: true, data: tag });
  });
};

/**
 * @api {get} /api/tags Read single tag
 * @apiName ReadTag
 * @apiGroup Tag
 *
 * @apiParam {String} id Tag ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} data List of tags
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
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

/**
 * @api {put} /api/tag Update existing tag (Admin only)
 * @apiName UpdateTag
 * @apiGroup Tag
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} name Tag name (Optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} data Tag updated
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
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

/**
 * @api {delete} /api/tag Delete existing tag (Admin only)
 * @apiName DeleteTag
 * @apiGroup Tag
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Tag ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
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
