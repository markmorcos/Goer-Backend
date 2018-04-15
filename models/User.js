'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var User = new Schema(
    {
        role: {
            type: String,
            enum: ['admin', 'business', 'user'],
            default: 'user'
        },
        picture: String,
        name: Object,
        location: {
            type: [Number],
            index: '2dsphere'
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
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Tag'
            }
        ]
    },
    { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

User.virtual('fullName').get(function() {
    return this.name.last ? this.name.first + ' ' + this.name.last : this.name
})

User.statics.findOneOrCreate = function findOneOrCreate(condition, doc, callback) {
    const self = this
    this.findOne(condition, function(err, result) {
        if (result) callback(err, result)
        else
            self.create(doc, function(newErr, newResult) {
                callback(err, newResult)
            })
    })
}

module.exports = mongoose.model('User', User)
