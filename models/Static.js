'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Static = new Schema({
  slug: String,
  title: String,
  text: String
});

module.exports = mongoose.model('Static', Static);
