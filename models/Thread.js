'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Thread = new Schema(
    {
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        title: String
    },
    { timestamps: true }
)

module.exports = mongoose.model('Thread', Thread)
