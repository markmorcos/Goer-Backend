'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Static = new Schema({
  title: String,
  slug: String,
  text: String
});

module.exports = mongoose.model('Static', Static);
