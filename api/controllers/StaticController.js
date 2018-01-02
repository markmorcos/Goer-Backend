'use strict';

var mongoose = require('mongoose');
var Static = mongoose.model('Static');

/**
 * @api {get} /api/list-statics Read all statics
 * @apiName ReadStatics
 * @apiGroup Static
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} statics List of statics
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.listStatics = function(req, res) {
  Static.find({}).exec(function(err, statics) {
    if (err) return res.send(err);
    statics = statics.reduce(function(a, b){
      a[b.slug] = { title: b.title, text: b.text };
      return a;
    }, {});    
    res.json({ success: true, data: { statics: statics } });
  });
};

/**
 * @api {get} /api/statics List (Admin only)
 * @apiName ListStatics
 * @apiGroup Static
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} statics List of statics
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to list statics' });
  }
  Static.find({}).exec(function(err, statics) {
    if (err) return res.send(err);
    res.json({ success: true, data: statics });
  });
};

/**
 * @api {post} /api/static Create (Admin only)
 * @apiName CreateStatic
 * @apiGroup Static
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} slug Static slug
 * @apiParam {String} title Static title
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} data Static created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to create statics' });
  }
  if (!req.body.slug) return res.status(400).json({ success: false, message: 'Slug is required' });
  if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required' });
  if (!req.body.text) return res.status(400).json({ success: false, message: 'Text is required' });
  var staticObj = new Static({ slug: req.body.slug, title: req.body.title, text: req.body.text });
  staticObj.save(function(err, staticObj) {
    if (err) return res.send(err);
    res.json({ success: true, data: staticObj });
  });
};

/**
 * @api {get} /api/statics Read (Admin only)
 * @apiName ReadStatic
 * @apiGroup Static
 *
 * @apiParam {String} id Static ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} data List of statics
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.read = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to read statics' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Static not found' });
  }
  Static.findById(req.params.id, function(err, staticObj) {
    if (err) return res.send(err);
    if (!staticObj) return res.status(404).json({ success: false, message: 'Static not found' });
    res.json({ success: true, data: staticObj });
  });
};

/**
 * @api {put} /api/static Update (Admin only)
 * @apiName UpdateStatic
 * @apiGroup Static
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} title Static title (Optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} data Static updated
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not allowed to update this static' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Static not found' });
  }
  Static.findById(req.params.id, function(err, staticObj) {
    if (!staticObj) return res.status(404).json({ success: false, message: 'Static not found' });
    staticObj.slug = req.body.slug || staticObj.slug;
    staticObj.title = req.body.title || staticObj.title;
    staticObj.text = req.body.text || staticObj.text;
    staticObj.save(function(err, staticObj) {
      if (err) return res.send(err);
      res.json({ success: true, data: staticObj });
    });
  });
};

/**
 * @api {delete} /api/static Delete (Admin only)
 * @apiName DeleteStatic
 * @apiGroup Static
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Static ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.stats(403).json({ success: false, message: 'You are not allowed to delete this static' });
  }
  if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Static not found' });
  }
  Static.findByIdAndRemove(req.params.id, function(err, staticObj) {
    if (err) return res.send(err);
    if (!staticObj) return res.status(404).json({ success: false, message: 'Static not found' });
    res.json({ success: true });
  });
};
