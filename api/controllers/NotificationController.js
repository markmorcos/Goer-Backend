'use strict';

var mongoose = require('mongoose');
var Notification = mongoose.model('Notification');
var moment = require('moment');
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
  moment.locale(req.decoded.language);
  Notification
  .find({ receiver: req.decoded._id })
  .populate({ path: 'sender receiver', select: 'name picture gender' })
  .sort('-createdAt')
  .exec(function(err, notifications) {
    if (err) return res.send(err);
    notifications = notifications.map(function(notification) {
      const user = notification.sender;
      return {
        title: i18n[req.decoded.language][notification.type].title(user),
        body: i18n[req.decoded.language][notification.type].body(user),
        user: user,
        relativeTime: moment(notification.createdAt).fromNow()
      };
    });
    res.json({ success: true, data: { notifications: notifications } });
  });
};
