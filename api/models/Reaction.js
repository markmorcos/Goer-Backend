'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Reaction = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  item: {
    model: {
      type: String,
      enum: ['Post', 'Review'],
      default: 'Post'
    },
    document: {
      type: Schema.Types.ObjectId,
      refPath: 'model'
    }
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    default: 'like'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reaction', Reaction);
