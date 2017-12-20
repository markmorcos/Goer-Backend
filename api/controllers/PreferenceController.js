'use strict';

var mongoose = require('mongoose');
var Preference = mongoose.model('Preference');

/**
 * @api {get} /api/preferences Read all preferences
 * @apiName ReadPreferences
 * @apiGroup Preference
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} preferences List of preferences
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  Preference.find({}).sort('name').exec(function(err, preferences) {
    if (err) return res.send(err);
    res.json({ success: true, data: { preferences: preferences } });
  });
};

/**
 * @api {post} /api/preference Create new preference (Admin only)
 * @apiName CreatePreference
 * @apiGroup Preference
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} name Preference name
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} preference Preference created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.json({ success: false, message: 'You are not allowed to create preferences' });
  }
  if (!req.body.name) return res.json({ success: false, message: 'Name is required' });
  var preference = new Preference({ name: req.body.name });
  preference.save(function(err, preference) {
    if (err) return res.send(err);
    res.json({ success: true, data: { preference: preference } });
  });
};

/**
 * @api {put} /api/preference Update existing preference (Admin only)
 * @apiName UpdatePreference
 * @apiGroup Preference
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} name Preference name (Optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} preference Preference updated
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.json({ success: false, message: 'You are not allowed to update this preference' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Preference.findById(req.body.id, function(err, preference) {
    if (!preference) return res.json({ success: false, message: 'Preference not found' });
    preference.name = req.body.name || preference.name;
    preference.save(function(err, preference) {
      if (err) return res.send(err);
      res.json({ success: true, data: { preference: preference } });
    });
  });
};

/**
 * @api {delete} /api/preference Delete existing preference (Admin only)
 * @apiName DeletePreference
 * @apiGroup Preference
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Preference ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (req.decoded.role !== 'admin') {
    return res.json({ success: false, message: 'You are not allowed to delete this preference' });
  }
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  Preference.findByIdAndRemove(req.body.id, function(err, preference) {
    if (err) return res.send(err);
    if (!preference) return res.json({ success: false, message: 'Preference not found' });
    res.json({ success: true });
  });
};
