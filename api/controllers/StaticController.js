'use strict'

var mongoose = require('mongoose')
var Static = mongoose.model('Static')

/**
 * @api {get} /api/list-statics Read all statics
 * @apiName ReadStatics
 * @apiGroup Static
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} statics List of statics
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.listStatics = function(req, res) {
    Static.find({}).exec(function(err, statics) {
        if (err) return res.send(err)
        statics = statics.reduce(function(a, b) {
            a[b.slug] = { title: b.title, text: b.text }
            return a
        }, {})
        res.json({ success: true, data: { statics: statics } })
    })
}

exports.list = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to list statics' })
    }
    Static.find({})
        .sort('title')
        .exec(function(err, statics) {
            if (err) return res.send(err)
            res.json({ success: true, data: statics })
        })
}

exports.create = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to create statics' })
    }
    if (!req.body.slug) return res.status(400).json({ success: false, message: 'Slug is required' })
    if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required' })
    if (!req.body.text) return res.status(400).json({ success: false, message: 'Text is required' })
    var staticObj = new Static({ slug: req.body.slug, title: req.body.title, text: req.body.text })
    staticObj.save(function(err, staticObj) {
        if (err) return res.send(err)
        res.json({ success: true, data: staticObj })
    })
}

exports.read = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to read statics' })
    }
    if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Static not found' })
    }
    Static.findById(req.params.id, function(err, staticObj) {
        if (err) return res.send(err)
        if (!staticObj) return res.status(404).json({ success: false, message: 'Static not found' })
        res.json({ success: true, data: staticObj })
    })
}

exports.update = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to update this static' })
    }
    if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Static not found' })
    }
    Static.findById(req.params.id, function(err, staticObj) {
        if (!staticObj) return res.status(404).json({ success: false, message: 'Static not found' })
        staticObj.slug = req.body.slug || staticObj.slug
        staticObj.title = req.body.title || staticObj.title
        staticObj.text = req.body.text || staticObj.text
        staticObj.save(function(err, staticObj) {
            if (err) return res.send(err)
            res.json({ success: true, data: staticObj })
        })
    })
}

exports.delete = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.stats(403).json({ success: false, message: 'You are not allowed to delete this static' })
    }
    if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Static not found' })
    }
    Static.findByIdAndRemove(req.params.id, function(err, staticObj) {
        if (err) return res.send(err)
        if (!staticObj) return res.status(404).json({ success: false, message: 'Static not found' })
        res.json({ success: true })
    })
}
