'use strict';

var mongoose = require('mongoose');
var Static = mongoose.model('Static');

/**
 * @api {get} /api/statics Read all statics
 * @apiName ReadStatics
 * @apiGroup Static
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} statics List of statics
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  Static.find({}).exec(function(err, statics) {
    if (err) return res.send(err);
    statics = statics.reduce(function(a, b){
      a[b.slug] = { title: b.title, text: b.text };
      return a;
    }, {});    
    res.json({ success: true, statics: statics });
  });
};

