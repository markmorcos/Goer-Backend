'use strict'

var mongoose = require('mongoose')
var Thread = mongoose.model('Thread')
var Message = mongoose.model('Message')

var notifications = require('../../util/notifications')

/**
 * @api {get} /api/threads Read all threads
 * @apiName ReadThreads
 * @apiGroup Thread
 *
 * @apiParam {String} token Authentication token
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} threads List of threads
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
    Thread.find({ users: req.decoded._id })
        .sort('-createdAt')
        .populate({ path: 'users', select: 'name picture' })
        .exec(function(err, threads) {
            if (err) return res.send(err)
            res.json({ success: true, data: { threads: threads } })
        })
}

function sendMessage(thread, req, res) {
    var message = new Message({ thread: thread._id, user: req.decoded._id, text: req.body.message })
    message.save(function(err, message) {
        if (err) return res.send(err)
        Thread.populate(thread, { path: 'users', select: 'name picture' }, function(err, thread) {
            thread.users.forEach(function(user) {
                if (user._id != req.decoded._id) notifications.pushNotify('message', user._id, res)
            })
            res.json({ success: true, data: { thread: thread } })
        })
    })
}

/**
 * @api {post} /api/threads Create a new thread
 * @apiName CreateThread
 * @apiGroup Thread
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} title Thread title (optional)
 * @apiParam {Array} users List of users in the thread
 * @apiParam {String} message Initial message
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} thread Created thread
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
    if (!req.body.users || !req.body.users.length || req.body.users.length < 2) {
        return res.status(400).json({ success: false, message: 'Please choose at least 2 users' })
    }
    if (!req.body.message) {
        return res.status(400).json({ success: false, message: 'Message is required' })
    }
    Thread.findOne(
        {
            $and: [{ users: { $all: req.body.users } }, { users: { $size: req.body.users.length } }]
        },
        function(err, thread) {
            if (err) return res.send(err)
            if (thread) {
                sendMessage(thread, req, res)
            } else {
                var thread = new Thread({ users: req.body.users, title: req.body.title || '' })
                thread.save(function(err, thread) {
                    if (err) return res.send(err)
                    sendMessage(thread, req, res)
                })
            }
        }
    )
}

/**
 * @api {put} /api/threads Update an existing thread
 * @apiName UpdateThread
 * @apiGroup Thread
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Thread ID
 * @apiParam {String} title Thread title (optional)
 * @apiParam {Array} users List of users in the thread (optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} thread Created thread
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
        return res.status(404).json({ success: false, message: 'Thread not found' })
    }
    if (req.body.users && req.body.users.length && req.body.users.length < 2) {
        return res.status(400).json({ success: false, message: 'Please choose at least 2 users' })
    }
    Thread.findById(req.body.id, function(err, thread) {
        if (err) return res.send(err)
        if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' })
        thread.title = req.body.title || thread.title
        thread.users = req.body.users === undefined ? thread.users : req.body.users
        thread.save(function(err, thread) {
            if (err) return res.send(err)
            Thread.populate(thread, { path: 'users', select: 'name picture' }, function(err, thread) {
                res.json({ success: true, data: { thread: thread } })
            })
        })
    })
}

/**
 * @api {delete} /api/threads Delete an existing thread
 * @apiName DeleteThread
 * @apiGroup Thread
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Thread ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} thread Created thread
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
        return res.status(404).json({ success: false, message: 'Thread not found' })
    }
    Thread.findByIdAndRemove(req.body.id, function(err, thread) {
        if (err) return res.send(err)
        if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' })
        Message.remove({ thread: thread._id }, function(err, messages) {
            if (err) return res.send(err)
            res.json({ success: true })
        })
    })
}
