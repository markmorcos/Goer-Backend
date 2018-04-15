'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Comment = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        item: {
            model: {
                type: String,
                enum: ['Post', 'Review'],
                default: 'Post'
            },
            document: {
                type: Schema.Types.ObjectId,
                refPath: 'model'
            }
        },
        text: String,
        mentions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true }
)

module.exports = mongoose.model('Comment', Comment)
