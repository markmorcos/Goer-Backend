'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Session = new Schema({
  user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  token: String,
  registrationToken: String
}, { timestamps: true });

module.exports = mongoose.model('Session', Session);
