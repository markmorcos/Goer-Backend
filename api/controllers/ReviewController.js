'use strict';

var mongoose = require('mongoose');
var Review = mongoose.model('Review');
var User = mongoose.model('User');

/**
 * @api {get} /api/reviews Read all reviews for a specific business
 * @apiName ReadReviews
 * @apiGroup Review
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
  if (!req.query.id) return res.json({ success: false, message: 'ID is required' });
  User.findById(req.query.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') return res.json({ success: false, message: 'Business not found' });
    Review
    .find({ business: req.query.id, text: { $ne: null } })
    .populate({ path: 'user', select: 'name picture' })
    .sort('-createAt')
    .exec(function(err, reviews) {
      if (err) return res.send(err);
      res.json({ success: true, data: { reviews: reviews } });
    });
  });
};

/**
 * @api {post} /api/review Create new review
 * @apiName CreateReview
 * @apiGroup Review
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID
 * @apiParam {String} rating Review rating; 1, 2, 3, 4 or 5
 * @apiParam {String} text Review text (optional)
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.rating) return res.json({ success: false, message: 'Rating is required' });
  if ([1, 2, 3, 4, 5].indexOf(Number(req.body.rating)) === -1) {
    return res.json({ success: false, message: 'Rating must be 1, 2, 3, 4 or 5' });
  }
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') return res.json({ success: false, message: 'Business not found' });
    Review.findOne({ user: req.decoded._id, business: req.body.id, text: { $eq: null } }, function(err, review) {
      if (err) return res.send(err);
      if (review && !req.body.text) return res.json({ success: false, message: 'You already rated this business' });
      Review.create({
        user: req.decoded._id,
        business: req.body.id,
        rating: req.body.rating,
        text: req.body.text || undefined
      }, function(err, review) {
        if (err) return res.send(err);
        Review.aggregate([
          { $match: { business: mongoose.Types.ObjectId(req.body.id) } },
          { $group: { _id: '$business', rating: { $avg: '$rating' } } }
        ], function(err, reviews) {
          console.log(reviews);
          reviews.push({ rating: 0 });
          res.json({ success: true, data: { review: reviews.shift().rating || 0 } });
        });
      });
    });
  });
};

/**
 * @api {put} /api/review Update existing review
 * @apiName UpdateReview
 * @apiGroup Review
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID if rating only or Review ID otherwise
 * @apiParam {String} rating Review rating; 1, 2, 3, 4 or 5 (optional)
 * @apiParam {String} text Review text (optional)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} review Review updated
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  if (!req.body.rating) return res.json({ success: false, message: 'Rating is required' });
  if ([1, 2, 3, 4, 5].indexOf(Number(req.body.rating)) === -1) {
    return res.json({ success: false, message: 'Rating must be 1, 2, 3, 4 or 5' });
  }
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') return res.json({ success: false, message: 'Business not found' });
    Review.findOne({ $or: [{ _id: req.body.id }, { user: req.decoded._id, business: req.body.id }] }, function(err, review) {
      if (err) return res.send(err);
      if (!review) return res.json({ success: false, message: 'Review not found' });
      review.rating = req.body.rating || review.rating;
      if (review._id == req.body.id) review.text = req.body.text || review.text;
      review.save(function(err, review) {
        if (err) return res.send(err);
        Review.aggregate([
          { $match: { business: review.business } },
          { $group: { _id: '$business', rating: { $avg: '$rating' } } }
        ], function(err, reviews) {
          console.log(reviews);
          reviews.push({ rating: 0 });
          res.json({ success: true, data: { review: Math.round(reviews.shift().rating * 100) / 100 || 0 } });
        });
      });
    });
  });
};

/**
 * @api {delete} /api/review Delete existing review
 * @apiName DeleteReview
 * @apiGroup Review
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Business ID if rating only or Review ID otherwise
 *
 * @apiSuccess {Boolean} success true
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (!req.body.id) return res.json({ success: false, message: 'ID is required' });
  User.findById(req.body.id, function(err, user) {
    if (err) return res.send(err);
    if (!user || user.role !== 'business') return res.json({ success: false, message: 'Business not found' });
    Review.findOne({ $or: [{ _id: req.body.id }, { user: req.decoded._id, business: req.body.id }] }, function(err, review) {
      if (err) return res.send(err);
      if (!review) return res.json({ success: false, message: 'Review not found' });
      review.remove(function(err, review) {
        if (err) return res.send(err);
        Review.aggregate([
          { $match: { business: review.business } },
          { $group: { _id: '$business', rating: { $avg: '$rating' } } }
        ], function(err, reviews) {
          reviews.push({ rating: 0 });
          res.json({ success: true, data: { review: Math.round(reviews.shift().rating * 100) / 100 || 0 } });
        });
      });
    });
  });
};
