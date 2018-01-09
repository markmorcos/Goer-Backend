'use strict';

var mongoose = require('mongoose');
var Message = mongoose.model('Message');

/**
 * @api {get} /api/messages Read all messages in a thread
 * @apiName ReadMessages
 * @apiGroup Message
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Thread ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} messages List of messages
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  if (!req.query.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
    return res.status(404).json({ success: false, message: 'Thread not found' });
  }
  Thread.findById(req.query.id, function(err, thread) {
    if (err) return res.send(err);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
    if (thread.users.indexOf(req.decoded._id) === -1) {
      return res.status(403).json({ success: false, message: 'You cannot view this thread' });
    }
    Message
    .find({ thread: req.query.id })
    .sort('createdAt')
    .populate({ path: 'user', select: 'name picture' })
    .exec(function(err, messages) {
      if (err) return res.send(err);
      res.json({ success: true, data: { messages: messages } });
    });
  });
};

/**
 * @api {post} /api/messages Create a new message
 * @apiName CreateMessage
 * @apiGroup Message
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Thread ID
 * @apiParam {String} text Message text
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} message Created message
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (!req.query.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
    return res.status(404).json({ success: false, message: 'Thread not found' });
  }
  if (!req.body.text) return res.status(400).json({ success: false, message: 'Text is required' });
  Thread.findById(req.query.id, function(err, thread) {
    if (err) return res.send(err);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
    if (thread.users.indexOf(req.decoded._id) === -1) {
      return res.status(403).json({ success: false, message: 'You cannot send messages in this thread' });
    }
    var message = new Message({ thread: req.body.id, user: req.decoded._id, text: req.body.text });
    message.save(function(err, message) {
      if (err) return res.send(err);
      Message.populate(message, { path: 'user', select: 'name picture' }, function(err, message) {
        if (err) return res.send(err);
        res.json({ success: true, data: { message: message } });
      });
    });
  });
};
