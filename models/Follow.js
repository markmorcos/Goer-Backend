'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Follow = new Schema({
  follower: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  followee: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  status: {
      type: String,
      enum: ['requested', 'accepted'],
      default: 'requested'
  }
}, { timestamps: true });

module.exports = mongoose.model('Follow', Follow);
