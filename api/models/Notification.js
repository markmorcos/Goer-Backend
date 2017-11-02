'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Notification = new Schema({
  type: String,
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', Notification);
