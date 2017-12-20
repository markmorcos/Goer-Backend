'use strict';

var mongoose = require('mongoose');
var Save = mongoose.model('Save');
var User = mongoose.model('User');

/**
 * @api {get} /api/saves Get saved businesses for a specific list
 * @apiName ReadSaves
 * @apiGroup Save
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} type Type; gone, togo or favorite
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  if (req.decoded.role !== 'user') {
    return res.json({ success: false, message: 'You are not allowed to perform this action' });
  }
  if (!req.query.type) return res.json({ success: false, message: 'Type is required' });
  Save
  .find({ user: req.decoded._id, type: req.query.type })
  .populate([
    { path: 'user', select: 'name picture' },
    { path: 'business', select: 'name picture' }
  ])
  .exec(function(err, saves) {
    if (err) return res.send(err);
    res.json({ success: true, data: { saves: saves } });
  });
}

/**
 * @api {post} /api/save-business Save business in a certain list
 * @apiName SaveBusiness
 * @apiGroup Save
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID
 * @apiParam {String} type Type; gone, togo or favorite
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (req.decoded.role !== 'user') {
    return res.json({ success: false, message: 'You are not allowed to perform this action' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.type) return res.json({ success: false, message: 'Type is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') {
      return res.json({ success: false, message: 'Place not found' });
    }
    Save.findOne({ user: req.decoded._id, business: user._id, type: req.body.type }, function(err, save) {
      if (err) return res.send(err);
      if (save) {
        return res.json({ success: false, message: 'Place already saved' });
      }
      Save.create({ user: req.decoded._id, business: user._id, type: req.body.type }, function(err, save) {
        return res.json({ success: true, data: { save: save } });
      });
    });
  });
}

/**
 * @api {delete} /api/unsave-business Unsave business from a certain list
 * @apiName UnsaveBusiness
 * @apiGroup Save
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID
 * @apiParam {String} type Type; gone, togo or favorite
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (req.decoded.role !== 'user') {
    return res.json({ success: false, message: 'You are not allowed to perform this action' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.type) return res.json({ success: false, message: 'Type is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') {
      return res.json({ success: false, message: 'Place not found' });
    }
    Save.findOne({ user: req.decoded._id, business: user._id, type: req.body.type }, function(err, save) {
      if (err) return res.send(err);
      if (!save) {
        return res.json({ success: false, message: 'Place already unsaved' });
      }
      save.remove(function(err, save) {
        res.json({ success: true });
      });
    });
  });
}