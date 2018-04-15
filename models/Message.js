'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Message = new Schema(
    {
        thread: {
            type: Schema.Types.ObjectId,
            ref: 'Thread'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String
    },
    { timestamps: true }
)

module.exports = mongoose.model('Message', Message)
