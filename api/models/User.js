'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  role: {
    type: String,
    enum: ['admin', 'business', 'user'],
    default: 'user'
  },
  picture: String,
  name: {
    first: String,
    last: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  email: String,
  password: String,
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  birthdate: Date,
  phone: String,
  confirmation: String,
  private: {
    type: Boolean,
    default: false
  },
  description: String,
  language: {
    type: String,
    enum: ['en', 'in'],
    default: 'en'
  },
  approved: {
    type: Boolean,
    default: true
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  facebook: String,
  preferences: [{
    type: Schema.Types.ObjectId,
    ref: 'Preference'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, { timestamps: true });

User.statics.findOneOrCreate = function findOneOrCreate(condition, doc, callback) {
  const self = this;
  this.findOne(condition, function(err, result) {
    if (result) callback(err, result);
    else self.create(doc, function(newErr, newResult) {
      callback(err, newResult);
    });
  });
};

module.exports = mongoose.model('User', User);
