'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Notification = new Schema({
  type: {
  	type: String,
  	enum: ['request', 'accept', 'reaction', 'review', 'comment', 'mention']
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  item: {
    model: {
      type: String,
      enum: ['Follow', 'Reaction', 'Review', 'Post'],
      default: 'Follow'
    },
    document: {
      type: Schema.Types.ObjectId,
      refPath: 'model'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', Notification);
