'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Save = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        business: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['gone', 'togo', 'favorite'],
            default: 'gone'
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Save', Save)
