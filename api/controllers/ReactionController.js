'use strict';

var mongoose = require('mongoose');
var Reaction = mongoose.model('Reaction');
var notifications = require('../../util/notifications');

/**
 * @api {post} /api/reactions Create new reaction
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
  if (!req.body.type) return res.status(400).json({ success: false, message: 'Type is required' });
  if (req.body.type !== 'like' && req.body.type !== 'dislike') {
    return res.status(400).json({ success: false, message: 'Type must be either like or dislike' });
  }
  if (!req.body.model) return res.status(400).json({ success: false, message: 'Model is required' });
  if (req.body.model !== 'Post' && req.body.model !== 'Review') {
    return res.status(400).json({ success: false, message: 'Model must be either Post or Review' });
  }
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  Reaction.findOne({
    user: req.decoded._id,
    'item.model': req.body.model,
    'item.document': req.body.id
  }, function(err, reaction) {
    if (err) return res.send(err);
    if (reaction) {
      return res.status(400).json({ success: false, message: 'Reaction already exists' });
    }
    Reaction.create({
      user: req.decoded._id,
      item: { model: req.body.model, document: req.body.id },
      type: req.body.type
    }, function(err, reaction) {
      if (err) return res.send(err);
      notifications.notify(
        'reaction',
        req.decoded._id,
        req.body.id,
        'Reaction',
        reaction._id,
        res,
        { push: false, action: req.body.type, model: req.body.model }
      );
    });
  });
};

/**
 * @api {put} /api/reactions Update existing reaction
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
    return res.status(403).json({ success: false, message: 'You are not allowed to create reactions' });
  }
  if (!req.body.type) return res.status(400).json({ success: false, message: 'Type is required' });
  if (req.body.type !== 'like' && req.body.type !== 'dislike') {
    return res.status(400).json({ success: false, message: 'Type must be either like or dislike' });
  }
  if (!req.body.model) return res.status(400).json({ success: false, message: 'Model is required' });
  if (req.body.model !== 'Post' && req.body.model !== 'Review') {
    return res.status(400).json({ success: false, message: 'Model must be either Post or Review' });
  }
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  Reaction.findOne({
    user: req.decoded._id,
    'item.model': req.body.model,
    'item.document': req.body.id
  }, function(err, reaction) {
    if (err) return res.send(err);
    if (!reaction) {
      return res.status(404).json({ success: false, message: 'Reaction not found' });
    }
    reaction.type = req.body.type;
    reaction.save(function(err, reaction) {
      if (err) return res.send(err);
      notifications.notify(
        'reaction',
        req.decoded._id,
        req.body.id,
        'Reaction',
        reaction._id,
        res,
        { push: false, action: req.body.type, model: req.body.model }
      );
    });
  });
};

/**
 * @api {delete} /api/reactions Delete existing reaction
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
    return res.status(403).json({ success: false, message: 'You are not allowed to create reactions' });
  }
  if (!req.body.type) return res.status(400).json({ success: false, message: 'Type is required' });
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  Reaction.findOne({
    user: req.decoded._id,
    'item.model': req.body.type,
    'item.document': req.body.id
  }, function(err, reaction) {
    if (err) return res.send(err);
    if (!reaction) {
      return res.status(404).json({ success: false, message: 'Reaction not found' });
    }
    reaction.remove(function(err, reaction) {
      if (err) return res.send(err);
      notifications.remove('Reaction', reaction._id, res);
    });
  });
};
