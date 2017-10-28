'use strict';

var mongoose = require('mongoose');
var Follow = mongoose.model('Follow');

exports.list = function(req, res) {
  var key = req.query.type === 'followers' ? 'followee' : 'follower';
  var query = { status: req.query.type === 'requests' ? 'requested' : 'accepted' };
  query[key] = req.decoded._id;
  console.log(query);
  Follow.find(query).populate({
    path: key,
    select: 'name picture',
    options: { sort: { name: 1 } }
  }).exec(function(err, follows) {
    if (err) return res.send(err);
    var users = [];
    follows.forEach(function(follow) {
      users.push(follow[key]);
    });
    res.json({ success: true, users: users });
  });
};

exports.follow = function(req, res) {
  if (!req.body.followee) return res.json({ success: false, message: 'Followee is required' });
  if (req.decoded._id == req.body.followee) {
    return res.json({ success: false, message: 'You cannot perform this action' });
  }
  Follow.findOne({ follower: req.decoded._id, followee: req.body.followee }, function(err, follow) {
    if (err) return res.send(err);
    if (follow) {
      if (follow.status === 'requested') {
        return res.json({ success: false, message: 'A request is already pending' });
      }
      if (follow.status === 'accepted') {
        return res.json({ success: false, message: 'You are already following this user' });
      }
    }
    var newFollow = new Follow({ follower: req.decoded._id, followee: req.body.followee });
    newFollow.save(function(err, follow) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
};

exports.accept = function(req, res) {
  if (!req.body.follower) return res.json({ success: false, message: 'Follower is required' });
  if (req.decoded._id == req.body.follower) {
    return res.json({ success: false, message: 'You cannot perform this action' });
  }
  Follow.findOne({ follower: req.body.follower, followee: req.decoded._id }, function(err, follow) {
    if (!follow) return res.json({ success: false, message: 'Follow request not found' });
    if (follow.status === 'accepted') {
      return res.json({ success: false, message: 'Request already accepted' });
    }
    follow.status = 'accepted';
    follow.save(function(err, follow) {
      if (err) return res.send(err);
      res.json({ success: true });
    });
  });
};

exports.reject = function(req, res) {
  if (!req.body.follower) return res.json({ success: false, message: 'Follower is required' });
  if (req.decoded._id == req.body.follower) {
    return res.json({ success: false, message: 'You cannot perform this action' });
  }
  Follow.findOneAndRemove({
    follower: req.body.follower,
    followee: req.decoded._id,
    status: 'requested'
  }, function(err, follow) {
    if (err) return res.send(err);
    if (!follow) return res.json({ success: false, message: 'Request does not exist' });
    res.json({ success: true });
  });
};

exports.delete = function(req, res) {
  if (!req.body.followee) return res.json({ success: false, message: 'Followee is required' });
  if (req.decoded._id == req.body.followee) {
    return res.json({ success: false, message: 'You cannot perform this action' });
  }
  Follow.findOneAndRemove({
    follower: req.decoded._id,
    followee: req.body.followee
  }, function(err, follow) {
    if (err) return res.send(err);
    if (!follow) return res.json({ success: false, message: 'Request does not exist' });
    res.json({ success: true });
  });
};
