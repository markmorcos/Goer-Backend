'use strict'

var mongoose = require('mongoose')
var Follow = mongoose.model('Follow')
var Session = mongoose.model('Session')
var notifications = require('../../util/notifications')

/**
 * @api {get} /api/follows Read all follows
 * @apiName ReadFollows
 * @apiGroup Follow
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} type Follow list type; followers, following or requests
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} users List of follows
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
    if (!req.query.type) return res.status(400).json({ success: false, message: 'Type is required' })
    var key = req.query.type === 'followers' ? 'followee' : 'follower'
    var query = { status: req.query.type === 'requests' ? 'requested' : 'accepted' }
    query[key] = req.decoded._id
    Follow.find(query)
        .populate({
            path: key,
            select: 'name picture',
            options: { sort: { createdAt: -1 } }
        })
        .exec(function(err, follows) {
            if (err) return res.send(err)
            res.json({
                success: true,
                data: {
                    users: follows.map(function(follow) {
                        return follow[key]
                    })
                }
            })
        })
}

/**
 * @api {post} /api/follow Follow user
 * @apiName FollowUser
 * @apiGroup Follow
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID to follow
 * @apiParam {String} registrationToken Device's Firebase registration token
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.follow = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (req.decoded._id == req.body.id) {
        return res.status(403).json({ success: false, message: 'You cannot perform this action' })
    }
    Follow.findOne({ follower: req.decoded._id, followee: req.body.id }, function(err, follow) {
        if (err) return res.send(err)
        if (follow) {
            if (follow.status === 'requested') {
                return res.status(400).json({ success: false, message: 'A request is already pending' })
            }
            if (follow.status === 'accepted') {
                return res
                    .status(400)
                    .json({ success: false, message: 'You are already following this user' })
            }
        }
        var newFollow = new Follow({ follower: req.decoded._id, followee: req.body.id })
        newFollow.save(function(err, follow) {
            if (err) return res.send(err)
            notifications.notify('request', req.decoded._id, req.body.id, 'Follow', follow._id, res)
        })
    })
}

/**
 * @api {put} /api/accept Accept follow request
 * @apiName AcceptRequest
 * @apiGroup Follow
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID to accept
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.accept = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (req.decoded._id == req.body.id) {
        return res.status(403).json({ success: false, message: 'You cannot perform this action' })
    }
    Follow.findOne({ follower: req.body.id, followee: req.decoded._id }, function(err, follow) {
        if (!follow) return res.status(404).json({ success: false, message: 'Follow request not found' })
        if (follow.status === 'accepted') {
            return res.status(400).json({ success: false, message: 'Request already accepted' })
        }
        follow.status = 'accepted'
        follow.save(function(err, follow) {
            if (err) return res.send(err)
            notifications.notify('accept', req.decoded._id, req.body.id, 'Follow', follow._id, res)
        })
    })
}

/**
 * @api {delete} /api/reject Reject follow request
 * @apiName RejectRequest
 * @apiGroup Follow
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID to reject
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.reject = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (req.decoded._id == req.body.id) {
        return res.status(403).json({ success: false, message: 'You cannot perform this action' })
    }
    Follow.findOneAndRemove(
        {
            follower: req.body.id,
            followee: req.decoded._id,
            status: 'requested'
        },
        function(err, follow) {
            if (err) return res.send(err)
            if (!follow) return res.status(404).json({ success: false, message: 'Request not found' })
            res.json({ success: true })
        }
    )
}

/**
 * @api {delete} /api/unfollow Unfollow user
 * @apiName UnfollowUser
 * @apiGroup Follow
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID to unfollow
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (req.decoded._id == req.body.id) {
        return res.status(403).json({ success: false, message: 'You cannot perform this action' })
    }
    Follow.findOneAndRemove(
        {
            follower: req.decoded._id,
            followee: req.body.id
        },
        function(err, follow) {
            if (err) return res.send(err)
            if (!follow) return res.status(404).json({ success: false, message: 'Request not found' })
            notifications.remove('Follow', follow._id, res)
        }
    )
}
