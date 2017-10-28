'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Rating = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  value: Number
}, { timestamps: true });

module.exports = mongoose.model('Rating', Rating);
