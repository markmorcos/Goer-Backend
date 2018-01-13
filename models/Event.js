'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Event = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  going: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  declined: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  thread: {
    type: Schema.Types.ObjectId,
    ref: 'Thread'
  },
  title: String,
  location: {
    type: [Number],
    index: '2dsphere'
  },
  description: String,
  startsAt: Date,
  endsAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Event', Event);
