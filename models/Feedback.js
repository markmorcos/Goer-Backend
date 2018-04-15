'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Feedback = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String
})

module.exports = mongoose.model('Feedback', Feedback)
