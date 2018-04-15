'use strict'

var mongoose = require('mongoose')
var Notification = mongoose.model('Notification')
var moment = require('moment')
var i18n = require('../../util/i18n')

/**
 * @api {get} /api/notifications Read all notifications
 * @apiName ReadNotifications
 * @apiGroup Notification
 *
 * @apiParam {String} token Authentication token
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} notifications List of notifications
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
    moment.locale(req.decoded.language)
    Notification.find({ receiver: req.decoded._id })
        .populate({ path: 'sender receiver', select: 'name picture gender' })
        .sort('-createdAt')
        .exec(function(err, notifications) {
            if (err) return res.send(err)
            notifications = notifications.map(function(notification) {
                return {
                    title: i18n[req.decoded.language][notification.type].title,
                    body: i18n[req.decoded.language][notification.type].body({ user: notification.sender }),
                    user: user,
                    createdAt: moment(notification.createdAt).format('DD MMMM YYYY [at] HH:mm a'),
                    relativeCreateTimestamp: moment(notification.createdAt).fromNow(),
                    updatedAt: moment(notification.updatedAt).format('DD MMMM YYYY [at] HH:mm a'),
                    relativeUpdateTimestamp: moment(notification.updatedAt).fromNow()
                }
            })
            res.json({ success: true, data: { notifications: notifications } })
        })
}
