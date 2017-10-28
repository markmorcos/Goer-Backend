'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Review = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  text: String
}, { timestamps: true });

module.exports = mongoose.model('Review', Review);
