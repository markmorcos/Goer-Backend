'use strict';

var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');

/**
 * @api {post} /api/comment Create new comment
 * @apiName CreateComment
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} model Model name; Post or Review
 * @apiParam {String} id Model ID
 * @apiParam {String} text Comment text
 * @apiParam {Array} mentions User IDs mentioned in the comment
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} comment Comment created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (!req.body.type) return res.json({ success: false, message: 'Type is required' });
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.text) return res.json({ success: false, message: 'Text is required' });
  Comment.create({
    user: req.decoded._id,
    item: { model: req.body.type, document: req.body.id },
    type: req.body.type,
    text: req.body.text,
    mentions: req.body.mentions
  }, function(err, comment) {
    if (err) return res.send(err);
    Comment.populate(comment, [
      { path: 'user', select: 'name picture' },
      { path: 'mentions', select: 'name picture' }
    ], function(err, comment) {
      if (err) return res.send(err);
      // TODO: send push notification
      res.json({ success: true, comment: comment });
    });
  });
};

/**
 * @api {put} /api/comment Update existing comment
 * @apiName UpdateComment
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Comment ID
 * @apiParam {String} text Comment text
 * @apiParam {String} mentions Users mentioned in the comment
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} comment Comment created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Comment.findById(req.body.id, function(err, comment) {
    if (err) return res.send(err);
    if (!comment) {
      return res.json({ success: false, message: 'Comment does not exist' });
    }
    if (comment.user != String(req.decoded._id)) {
      return res.json({ success: false, message: 'You are not allowed to edit this comment' });
    }
    comment.text = req.body.text || comment.text;
    const mentions = req.body.mentions === undefined ? comment.mentions : req.body.mentions || [];
    mentions.forEach(function(mention) {
      if (comment.mentions.indexOf(mention) === -1) {
        // TODO: add notification
        // TODO: send push notification
      }
    });
    comment.mentions.forEach(function(mention) {
      if (mentions.indexOf(mention) === -1) {
        // TODO: remove notification
      }
    });
    comment.mentions = mentions;
    comment.save(function(err, comment) {
      if (err) return res.send(err);
      Comment.populate(comment, [
        { path: 'user', select: 'name picture' },
        { path: 'mentions', select: 'name picture' }
      ], function(err, comment) {
        if (err) return res.send(err);
        res.json({ success: true, comment: comment });
      });
    });
  });
};

/**
 * @api {delete} /api/comment Delete existing comment
 * @apiName DeleteComment
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Comment ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Comment.findById(req.body.id, function(err, comment) {
    if (err) return res.send(err);
    if (!comment) {
      return res.json({ success: false, message: 'Comment does not exist' });
    }
    if (comment.user != String(req.decoded._id)) {
      return res.json({ success: false, message: 'You are not allowed to delete this comment' });
    }
    comment.remove(function(err, comment) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
};
