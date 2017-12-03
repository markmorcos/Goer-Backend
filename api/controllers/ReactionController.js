'use strict';

var mongoose = require('mongoose');
var Reaction = mongoose.model('Reaction');

/**
 * @api {post} /api/reaction Create new reaction
 * @apiName CreateReaction
 * @apiGroup Reaction
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} type Reaction type; like or dislike
 * @apiParam {String} model Model name; Post or Review
 * @apiParam {String} id Model ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (!req.body.type) return res.json({ success: false, message: 'Type is required' });
  if (!req.body.model) return res.json({ success: false, message: 'Model is required' });
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Reaction.findOne({
    user: req.decoded._id,
    'item.model': req.body.model,
    'item.document': req.body.id
  }, function(err, reaction) {
    if (err) return res.send(err);
    if (reaction) {
      return res.json({ success: false, message: 'Reaction already exists' });
    }
    Reaction.create({
      user: req.decoded._id,
      item: { model: req.body.model, document: req.body.id },
      type: req.body.type
    }, function(err, reaction) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
};

/**
 * @api {put} /api/reaction Update existing reaction
 * @apiName UpdateReaction
 * @apiGroup Reaction
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} type Reaction type; like or dislike
 * @apiParam {String} model Model name; Post or Review
 * @apiParam {String} id Model ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  if (req.decoded.role !== 'user') {
    return res.json({ success: false, message: 'You are not allowed to create reactions' });
  }
  if (!req.body.type) return res.json({ success: false, message: 'Type is required' });
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Reaction.findOne({
    user: req.decoded._id,
    'item.model': req.body.model,
    'item.document': req.body.id
  }, function(err, reaction) {
    if (err) return res.send(err);
    if (!reaction) {
      return res.json({ success: false, message: 'Reaction does not exist' });
    }
    reaction.type = req.body.type;
    reaction.save(function(err, reaction) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
};

/**
 * @api {delete} /api/reaction Delete existing reaction
 * @apiName DeleteReaction
 * @apiGroup Reaction
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} model Model name; Post or Review
 * @apiParam {String} id Model ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (req.decoded.role !== 'user') {
    return res.json({ success: false, message: 'You are not allowed to create reactions' });
  }
  if (!req.body.type) return res.json({ success: false, message: 'Type is required' });
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Reaction.findOne({
    user: req.decoded._id,
    'item.model': req.body.type,
    'item.document': req.body.id
  }, function(err, reaction) {
    if (err) return res.send(err);
    if (!reaction) {
      return res.json({ success: false, message: 'Reaction does not exist' });
    }
    reaction.remove(function(err, reaction) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
};
