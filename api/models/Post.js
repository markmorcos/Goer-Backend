'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Comment = require('./Comment');
var Reaction = require('./Reaction');

var Post = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  text: String,
  pictures: [String],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [Comment],
  reactions: [Reaction]
}, { timestamps: true });

module.exports = mongoose.model('Preference', Preference);
