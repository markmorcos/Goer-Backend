'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  picture: String,
  name: String,
  firstName: String,
  lastName: String,
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
    enum: ['en', 'ar'],
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
  instagram: String,
  preferences: [{
    type: Schema.Types.ObjectId,
    ref: 'Preference'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  role: {
    type: String,
    enum: ['admin', 'manager', 'business', 'user'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', User);
