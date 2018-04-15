'use strict'

var mongoose = require('mongoose')
var Post = mongoose.model('Post')
var User = mongoose.model('User')
var Follow = mongoose.model('Follow')
var multer = require('multer')
var moment = require('moment')

var fs = require('../../util/fs')
var constants = require('../../util/constants')
var notifications = require('../../util/notifications')

function populatePosts(query, userId, page = 1) {
    return Post.aggregate([
        { $match: query },
        { $lookup: { from: 'reactions', localField: '_id', foreignField: 'item.document', as: 'reactions' } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $lookup: { from: 'users', localField: 'business', foreignField: '_id', as: 'business' } },
        { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'users', localField: 'mentions', foreignField: '_id', as: 'mentions' } },
        { $unwind: '$mentions' },
        {
            $project: {
                user: { _id: true, name: true, picture: true },
                business: { _id: true, name: true },
                title: true,
                location: true,
                text: true,
                pictures: true,
                mentions: { _id: true, name: true, picture: true },
                reactionCount: {
                    likes: {
                        $size: {
                            $filter: {
                                input: '$reactions',
                                as: 'reactions',
                                cond: { $eq: ['$$reactions.type', 'like'] }
                            }
                        }
                    },
                    dislikes: {
                        $size: {
                            $filter: {
                                input: '$reactions',
                                as: 'reactions',
                                cond: { $eq: ['$$reactions.type', 'dilike'] }
                            }
                        }
                    }
                },
                reaction: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: '$reactions',
                                as: 'reactions',
                                cond: { $eq: ['$$reactions.user', userId] }
                            }
                        },
                        0
                    ]
                },
                createdAt: true
            }
        },
        { $unwind: '$reactionCount' },
        { $unwind: '$mentions.name' },
        { $unwind: '$mentions.picture' },
        {
            $group: {
                _id: '$_id',
                user: { $first: '$user' },
                business: { $first: '$business' },
                title: { $first: '$title' },
                location: { $first: '$location' },
                text: { $first: '$text' },
                pictures: { $first: '$pictures' },
                mentions: { $push: '$mentions' },
                reactions: { $first: '$reactionCount' },
                reaction: { $first: '$reaction.type' },
                createdAt: { $first: '$createdAt' }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * constants.perPage },
        { $limit: constants.perPage }
    ])
}

function configureTimestamps(post) {
    post.relativeCreateTimestamp = moment(post.createdAt).fromNow()
    post.createdAt = moment(post.createdAt).format('DD MMMM YYYY [at] hh:mm a')
    post.relativeCreateTimestamp = moment(post.updatedAt).fromNow()
    post.updatedAt = moment(post.updatedAt).format('DD MMMM YYYY [at] hh:mm a')
    return post
}

/**
 * @api {get} /api/feed Read feed of a specific user
 * @apiName ReadFeed
 * @apiGroup Post
 * @apiParam {String} token Authentication token
 * @apiParam {String} page Page (optional, default: 1)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} posts Posts for the specified user
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.feed = function(req, res) {
    Follow.find({ follower: req.decoded._id, status: 'accepted' }, function(err, follows) {
        if (err) return res.send(err)
        const userIds = follows.map(function(follow) {
            return follow._id
        })
        userIds.push(req.decoded._id)
        populatePosts({ user: { $in: userIds } }, req.decoded._id, req.query.page).exec(function(err, posts) {
            if (err) return res.send(err)
            moment.locale(req.decoded.language)
            res.json({ success: true, data: { posts: posts.map(configureTimestamps) } })
        })
    })
}

/**
 * @api {get} /api/posts Read posts of a specific user
 * @apiName ReadPosts
 * @apiGroup Post
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id User ID (optional, default: current user ID)
 * @apiParam {String} page Page (optional, default: 1)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} posts Posts for the specified user
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
    User.findById(req.query.id || req.decoded._id, function(err, user) {
        if (err) return res.send(err)
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        Follow.findOne({ follower: req.decoded._id, followee: user._id, status: 'accepted' }, function(
            err,
            follow
        ) {
            if (err) return res.send(err)
            if (!follow && req.decoded._id != user._id && user.private) {
                return res.status(401).json({ success: false, message: 'This profile is private' })
            }
            populatePosts({ user: user._id }, req.decoded._id, req.query.page).exec(function(err, posts) {
                if (err) return res.send(err)
                moment.locale(req.decoded.language)
                res.json({ success: true, data: { posts: posts.map(configureTimestamps) } })
            })
        })
    })
}

exports.validateNewPost = function(req, res, next) {
    var valid = true
    if (valid && !req.body.business && !req.body.title) {
        ;(valid = false), res.status(400).json({ success: false, message: 'Please choose or type a place' })
    }
    if (valid && (!req.body.latitude || !req.body.longitude)) {
        ;(valid = false), res.status(400).json({ success: false, message: 'Location is required' })
    }
    if (valid && !req.body.text && !req.files.length) {
        ;(valid = false), res.status(400).json({ success: false, message: 'Please add text or pictures' })
    }
    if (!valid)
        req.files.forEach(function(file) {
            fs.delete(file.path)
        })
    return next()
}

function populatePost(req, res, next) {
    var post = new Post({
        user: req.decoded._id,
        business: req.body.business,
        title: req.body.title,
        location: [req.body.latitude, req.body.longitude],
        text: req.body.text,
        pictures: [],
        mentions: req.body.mentions || []
    })
    req.files.forEach(function(file, index) {
        const directory = `uploads/posts/${post._id}/pictures`
        fs.mkdir(`public/${directory}`)
        const ext = file.originalname.split('.').pop()
        const path = `public/${directory}/${index}.${ext}`
        fs.move(file.path, path)
        post.pictures.push(`${constants.url}/${directory}`)
    })
    next(post)
}

/**
 * @api {post} /api/posts Create new post
 * @apiName CreatePost
 * @apiGroup Post
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} business Business ID
 * @apiParam {String} title Place name in case business ID is empty
 * @apiParam {String} latitude Location latitude
 * @apiParam {String} location Location longitude
 * @apiParam {String} text Post text (optional if pictures are not empty)
 * @apiParam {Array} pictures Pictures (optional if text is not empty)
 * @apiParam {Array} mentions Mentions (optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} post New post details
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
    populatePost(req, res, function(post) {
        post.save(function(err, post) {
            if (err) return res.send(err)
            Post.populate(
                post,
                [
                    { path: 'user', select: 'name picture' },
                    { path: 'business', select: 'name picture' },
                    { path: 'mentions', select: 'name picture' }
                ],
                function(err, post) {
                    if (err) return res.send(err)
                    post.mentions.forEach(function(mention) {
                        notifications.notify(
                            'mention',
                            req.decoded._id,
                            mention,
                            'Post',
                            post._id,
                            res,
                            null,
                            function(err, notification) {
                                if (err) return res.send(err)
                                res.json({ success: true, data: { post: post } })
                            }
                        )
                    })
                }
            )
        })
    })
}

/**
 * @api {get} /api/post Read post
 * @apiName ReadPost
 *
 * @apiGroup Post
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Post ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} post Post details
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.read = function(req, res) {
    if (!req.query.id) return res.status(400).json({ success: false, message: 'ID is required' })
    populatePosts({ _id: mongoose.Types.ObjectId(req.query.id) }, req.decoded._id, 1).exec(function(
        err,
        posts
    ) {
        if (err) return res.send(err)
        if (!posts.length) return res.status(404).json({ success: false, message: 'Post not found' })
        const post = posts[0]
        if (req.decoded._id != post.user._id && post.user.private) {
            return res.status(401).json({ success: false, message: 'This post is private' })
        }
        res.json({ success: true, data: { post: post } })
    })
}

exports.validateExistingPost = function(req, res, next) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    var valid = true
    Post.findById(req.body.id, function(err, post) {
        if (valid && err) (valid = false), res.send(err)
        if (valid && !post)
            (valid = false), res.status(404).json({ success: false, message: 'Post not found' })
        if (valid && req.decoded._id != String(post.user)) {
            ;(valid = false),
                res.status(403).json({ success: false, message: 'You are not allowed to update this post' })
        }
        if (!valid)
            return req.files.forEach(function(file) {
                fs.delete(file.path)
            })
        req.post = post
        next()
    })
}

/**
 * @api {put} /api/posts Update existing post
 * @apiName UpdatePost
 * @apiGroup Post
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Post ID
 * @apiParam {String} business Business ID (optional)
 * @apiParam {String} title Place name in case business ID is empty (optional)
 * @apiParam {String} latitude Location latitude (optional)
 * @apiParam {String} longitude Location longitude (optional)
 * @apiParam {String} text Post text (optional)
 * @apiParam {Array} pictures Pictures (optional)
 * @apiParam {Array} mentions Mentions (optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} user Updated user details
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
    const post = req.post
    post.business = req.body.business || post.business
    post.title = req.body.title || post.title
    post.location =
        req.body.latitude && req.body.longitude ? [req.body.latitude, req.body.longitude] : post.location
    post.text = req.body.text || post.text
    post.pictures = req.body.pictures === undefined ? post.pictures : req.body.pictures || []
    var max = 0
    post.pictures.forEach(function(picture) {
        max = Math.max(max, Number(picture.split('.').reverse()[1]))
    })
    req.files.forEach(function(file, index) {
        const directory = `uploads/posts/${post._id}/pictures`
        fs.mkdir(`public/${directory}`)
        const ext = file.originalname.split('.').pop()
        const path = `public/${directory}/${index + max}.${ext}`
        fs.move(file.path, path)
        post.picture = `${constants.url}/${directory}`
    })
    const mentions = req.body.mentions === undefined ? post.mentions : req.body.mentions || []
    mentions.forEach(function(mention) {
        if (post.mentions.indexOf(mention) === -1) {
            notifications.notify('mention', req.decoded._id, mention, 'Post', post._id, res, null, function(
                err,
                notification
            ) {})
        }
    })
    post.mentions.forEach(function(mention) {
        if (mentions.indexOf(mention) === -1) {
            notifications.remove('Post', post._id, res, function(err, notification) {}, { receiver: mention })
        }
    })
    post.mentions = mentions
    post.save(function(err, post) {
        if (err) return res.send(err)
        populatePosts({ _id: post._id }, req.decoded._id, 1).exec(function(err, posts) {
            if (err) return res.send(err)
            res.json({ success: true, data: { post: posts[0] } })
        })
    })
}

/**
 * @api {delete} /api/posts Delete existing post
 * @apiName DeletePost
 * @apiGroup Post
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Post ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' })
    Post.findById(req.body.id, function(err, post) {
        if (err) return res.send(err)
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
        if (req.decoded._id != String(post.user)) {
            return res
                .status(403)
                .json({ success: false, message: 'You are not allowed to delete this post' })
        }
        post.remove(function(err, post) {
            if (err) return res.send(err)
            fs.rmdir(`public/uploads/posts/${post._id}`)
            res.json({ success: true })
        })
    })
}
