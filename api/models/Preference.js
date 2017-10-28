'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Preference = new Schema({
  name: String
});

module.exports = mongoose.model('Preference', Preference);
