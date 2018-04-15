'use strict'

var mongoose = require('mongoose')
var Notification = mongoose.model('Notification')
var Session = mongoose.model('Session')

var admin = require('firebase-admin')

var i18n = require('./i18n')

exports.notify = function(
    type,
    sender,
    receiver,
    model,
    doc,
    res,
    options = { push: true },
    callback = null
) {
    Notification.create(
        {
            type: type,
            sender: sender,
            receiver: receiver,
            item: { model: model, document: doc }
        },
        function(err, notification) {
            if (callback) callback(err, notification)
            else {
                if (err) return res.send(err)
                res.json({ success: true })
            }
            if (options.push) {
                Session.find({ user: receiver })
                    .populate({ path: 'user', select: 'name picture gender' })
                    .exec(function(err, sessions) {
                        if (err) return res.send(err)
                        sessions.forEach(function(session) {
                            if (session.registrationToken) {
                                options.user = session.user
                                options.model = model
                                var payload = {
                                    notification: {
                                        title: i18n[session.user.language][type].title,
                                        body: i18n[session.user.language][type].message(options)
                                    }
                                }
                                admin
                                    .messaging()
                                    .sendToDevice(session.registrationToken, payload)
                                    .then(function(response) {
                                        console.log('Successfully sent message:', response)
                                        // if (response.failureCount) session.remove();
                                    })
                                    .catch(function(error) {
                                        console.log('Error sending message:', error)
                                    })
                            }
                        })
                    })
            }
        }
    )
}

exports.pushNotify = function(type, receiver, res) {
    Session.find({ user: receiver })
        .populate({ path: 'user', select: 'name picture gender language' })
        .exec(function(err, sessions) {
            if (err) return res.send(err)
            sessions.forEach(function(session) {
                if (session.registrationToken) {
                    var payload = {
                        notification: {
                            title: i18n[session.user.language][type].title,
                            body: i18n[session.user.language][type].message({ user: session.user })
                        }
                    }
                    admin
                        .messaging()
                        .sendToDevice(session.registrationToken, payload)
                        .then(function(response) {
                            console.log('Successfully sent message:', response)
                            // if (response.failureCount) session.remove();
                        })
                        .catch(function(error) {
                            console.log('Error sending message:', error)
                        })
                }
            })
        })
}

exports.remove = function(model, doc, res, callback = null, query = {}) {
    query['item.model'] = model
    query['item.document'] = doc
    Notification.find(query)
        .remove()
        .exec(function(err, notifications) {
            if (callback) callback(err, notifications)
            else {
                if (err) return res.send(err)
                res.json({ success: true })
            }
        })
}
