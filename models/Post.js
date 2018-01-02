'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  text: String,
  pictures: [String],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', Post);
