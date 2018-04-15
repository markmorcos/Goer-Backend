'use strict'

var mongoose = require('mongoose')
var Comment = mongoose.model('Comment')
var notifications = require('../../util/notifications')

/**
 * @api {get} /api/comments Read all comments for a specific post or review
 * @apiName ReadComments
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} model Model name; Post or Review
 * @apiParam {String} id Model ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
    if (!req.query.model) return res.status(400).json({ success: false, message: 'Model is required' })
    if (req.query.model !== 'Post' && req.query.model !== 'Review') {
        return res.json({ success: false, mesage: 'Model must be either Post or Review' })
    }
    if (!req.query.id) return res.status(400).json({ success: false, message: 'ID is required' })
    const Model = mongoose.model(req.query.model)
    Model.findOne({ _id: req.query.id })
        .populate({ path: 'user', select: 'private' })
        .exec(function(err, model) {
            if (err) return res.send(err)
            if (!model) return res.json({ success: false, message: `${req.query.model} not found` })
            if (model.user.private) {
                return res
                    .status(401)
                    .json({ success: false, message: 'You are not allowed to view these comments' })
            }
            Comment.find({ 'item.model': req.query.model, 'item.document': req.query.id })
                .populate([
                    { path: 'user', select: 'name picture' },
                    { path: 'mentions', select: 'name picture' }
                ])
                .sort('-createAt')
                .exec(function(err, comments) {
                    if (err) return res.send(err)
                    res.json({ success: true, data: { comments: comments } })
                })
        })
}

/**
 * @api {post} /api/comments Create new comment
 * @apiName CreateComment
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} model Model name; Post or Review
 * @apiParam {String} id Model ID
 * @apiParam {String} text Comment text
 * @apiParam {Array} mentions User IDs mentioned in the comment
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} comment Comment created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
    if (!req.body.type) return res.status(400).json({ success: false, message: 'Type is required' })
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!req.body.text) return res.status(400).json({ success: false, message: 'Text is required' })
    Comment.create(
        {
            user: req.decoded._id,
            item: { model: req.body.type, document: req.body.id },
            type: req.body.type,
            text: req.body.text,
            mentions: req.body.mentions
        },
        function(err, comment) {
            if (err) return res.send(err)
            Comment.populate(
                comment,
                [{ path: 'user', select: 'name picture' }, { path: 'mentions', select: 'name picture' }],
                function(err, comment) {
                    if (err) return res.send(err)
                    comment.mentions.forEach(function(mention) {
                        notifications.notify(
                            'mention',
                            req.decoded._id,
                            mention,
                            'Comment',
                            comment._id,
                            res,
                            null,
                            function(err, notification) {
                                if (err) return res.send(err)
                                res.json({ success: true, data: { comment: comment } })
                            }
                        )
                    })
                }
            )
        }
    )
}

/**
 * @api {put} /api/comments Update existing comment
 * @apiName UpdateComment
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Comment ID
 * @apiParam {String} text Comment text
 * @apiParam {String} mentions Users mentioned in the comment
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} comment Comment created
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    Comment.findById(req.body.id, function(err, comment) {
        if (err) return res.send(err)
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' })
        }
        if (comment.user != String(req.decoded._id)) {
            return res
                .status(403)
                .json({ success: false, message: 'You are not allowed to edit this comment' })
        }
        comment.text = req.body.text || comment.text
        const mentions = req.body.mentions === undefined ? comment.mentions : req.body.mentions || []
        mentions.forEach(function(mention) {
            if (comment.mentions.indexOf(mention) === -1) {
                notifications.notify(
                    'mention',
                    req.decoded._id,
                    mention,
                    'Comment',
                    comment._id,
                    res,
                    null,
                    function(err, notification) {
                        if (err) return res.send(err)
                        res.json({ success: true, data: { comment: comment } })
                    }
                )
            }
        })
        comment.mentions.forEach(function(mention) {
            if (mentions.indexOf(mention) === -1) {
                notifications.remove('Comment', comment._id, res, function(err, notification) {}, {
                    receiver: mention
                })
            }
        })
        comment.mentions = mentions
        comment.save(function(err, comment) {
            if (err) return res.send(err)
            Comment.populate(
                comment,
                [{ path: 'user', select: 'name picture' }, { path: 'mentions', select: 'name picture' }],
                function(err, comment) {
                    if (err) return res.send(err)
                    res.json({ success: true, data: { comment: comment } })
                }
            )
        })
    })
}

/**
 * @api {delete} /api/comments Delete existing comment
 * @apiName DeleteComment
 * @apiGroup Comment
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Comment ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    Comment.findById(req.body.id, function(err, comment) {
        if (err) return res.send(err)
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' })
        }
        if (comment.user != String(req.decoded._id)) {
            return res
                .status(403)
                .json({ success: false, message: 'You are not allowed to delete this comment' })
        }
        comment.remove(function(err, comment) {
            if (err) return res.send(err)
            notifications.remove('Comment', comment._id, res)
        })
    })
}
