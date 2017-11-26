'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Comment = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  text: String,
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', Comment);
