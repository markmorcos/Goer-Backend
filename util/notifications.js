'use strict';

var mongoose = require('mongoose');
var Notification = mongoose.model('Notification');
var Session = mongoose.model('Session');

var admin = require('firebase-admin');

var i18n = require('./i18n');

exports.notify = function(type, sender, receiver, res) {
  Notification.create({
    type: type,
    sender: sender,
    receiver: receiver
  }, function(err, notification) {
    if (err) return res.send(err);
    res.json({ success: true });
    Session
    .find({ user: receiver })
    .populate('user')
    .exec(function(err, sessions) {
      if (err) return res.send(err);
      sessions.forEach(function(session) {
        if (session.registrationToken) {
          const user = session.user;
          const fullName = user.name.first + ' ' + user.name.last;
          var payload = {
            notification: {
              title: i18n[user.language][type].title(user),
              body: i18n[user.language][type].body(user)
            }
          };
          admin.messaging().sendToDevice(session.registrationToken, payload)
          .then(function(response) {
            console.log('Successfully sent message:', response);
            // if (response.failureCount) session.remove();
          })
          .catch(function(error) {
            console.log('Error sending message:', error);
          });
        }
      });
    });
  });
}