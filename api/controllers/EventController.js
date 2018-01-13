'use strict';

var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var Thread = mongoose.model('Thread');
var moment = require('moment');

function configureTimestamps(event) {
  event = event.toObject();
	event.relativeStartTimestamp = moment(event.startsAt).fromNow();
	event.startsAt = moment(event.startsAt).format('DD MMMM YYYY [at] hh:mm a');
	event.relativeEndTimestamp = moment(event.endsAt).fromNow();
	event.endsAt = moment(event.endsAt).format('DD MMMM YYYY [at] HH:mm a');
  event.relativeCreateTimestamp = moment(event.createdAt).fromNow();
  event.createdAt = moment(event.createdAt).format('DD MMMM YYYY [at] HH:mm a');
  event.relativeUpdateTimestamp = moment(event.updatedAt).fromNow();
  event.updatedAt = moment(event.updatedAt).format('DD MMMM YYYY [at] HH:mm a');
  return event;
}

/**
 * @api {get} /api/events Read all events in a specific thread
 * @apiName ReadEvents
 * @apiGroup Event
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} thread Thread ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} events List of events
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.list = function(req, res) {
	if (!req.query.thread) return res.status(400).json({ success: false, message: 'Thread is required' });
  if (!mongoose.Types.ObjectId.isValid(req.query.thread)) {
    return res.status(404).json({ success: false, message: 'Thread not found' });
  }
  Thread.findById(req.query.thread, function(err, thread) {
  	if (err) return res.send(err);
  	if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
  	if (thread.users.indexOf(req.decoded._id) === -1) {
  		return res.status(403).json({ success: false, message: 'You are not allowed to read these events' });
  	}
	  Event
	  .find({ thread: req.query.thread })
	  .populate({ path: 'user', select: 'name picture' })
	  .exec(function(err, events) {
	    if (err) return res.send(err);
	  	moment.locale(req.decoded.language);
	    res.json({ success: true, data: { events: events.map(configureTimestamps) } });
	  });
  });
};

/**
 * @api {post} /api/events Create a new event
 * @apiName CreateEvent
 * @apiGroup Event
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} thread Thread ID
 * @apiParam {String} title Event title
 * @apiParam {String} latitude Event location latitude
 * @apiParam {String} longitude Event location longitude
 * @apiParam {String} description Event description (optional)
 * @apiParam {Date} startsAt Event start timestamp (YYYY-MM-DD HH:mm:ss)
 * @apiParam {Date} endsAt Event end timestamp (YYYY-MM-DD HH:mm:ss)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} event Created event
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.create = function(req, res) {
	if (!req.body.thread) return res.status(400).json({ success: false, message: 'Thread is required' });
  if (!mongoose.Types.ObjectId.isValid(req.body.thread)) {
    return res.status(404).json({ success: false, message: 'Thread not found' });
  }
	if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required' });
	if (!req.body.latitude) return res.status(400).json({ success: false, message: 'Latitude is required' });
	if (!req.body.longitude) return res.status(400).json({ success: false, message: 'Longitude is required' });
	if (!req.body.startsAt) return res.status(400).json({ success: false, message: 'Start timestamp is required' });
	if (moment().diff(moment(req.body.startsAt)) > 0) {
		return res.status(400).json({ success: false, message: 'Start timestamp must be in the future' });
	}
	if (!req.body.endsAt) return res.status(400).json({ success: false, message: 'End timestamp is required' });
	if (moment(req.body.startsAt).diff(moment(req.body.endsAt)) > 0) {
		return res.status(400).json({ success: false, message: 'End timestamp must after start timestamp' });
	}
  Thread.findById(req.body.thread, function(err, thread) {
  	if (err) return res.send(err);
  	if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
  	if (thread.users.indexOf(req.decoded._id) === -1) {
  		return res.status(403).json({ success: false, message: 'You are not allowed to read these events' });
  	}
	  Event.create({
	  	user: req.decoded._id,
	  	thread: req.body.thread,
	  	title: req.body.title,
	  	location: [req.body.latitude, req.body.longitude],
	  	description: req.body.description || '',
	  	startsAt: moment(req.body.startsAt),
	  	endsAt: moment(req.body.endsAt)
	  }, function(err, event) {
	    if (err) return res.send(err);
	    Event.populate(event, { path: 'user', select: 'name picture' }, function(err, event) {
	    	if (err) return res.send(err);
	    	res.json({ success: true, data: { event: configureTimestamps(event) } });
	    });
	  });
	});
};

/**
 * @api {get} /api/event Read a single event
 * @apiName ReadEvent
 * @apiGroup Event
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Event ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Array} events List of events
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.read = function(req, res) {
	if (!req.query.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  Event
  .findById(req.query.id)
  .populate([
  	{ path: 'user', select: 'name picture' },
  	{ path: 'going', select: 'name picture' },
  	{ path: 'declined', select: 'name picture' }
  ])
  .exec(function(err, event) {
    if (err) return res.send(err);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
	  Thread.findById(event.thread, function(err, thread) {
	  	if (err) return res.send(err);
	  	if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
	  	if (thread.users.indexOf(req.decoded._id) === -1) {
	  		return res.status(403).json({ success: false, message: 'You are not allowed to read these events' });
	  	}
	  	moment.locale(req.decoded.language);
	    res.json({ success: true, data: { event: configureTimestamps(event) } });
	  });
  });
};

/**
 * @api {put} /api/events Update an existing event
 * @apiName UpdateEvent
 * @apiGroup Event
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Event ID
 * @apiParam {String} title Event title
 * @apiParam {String} latitude Event location latitude
 * @apiParam {String} longitude Event location longitude
 * @apiParam {String} description Event description (optional)
 * @apiParam {Date} startsAt Event start timestamp (YYYY-MM-DD HH:mm:ss)
 * @apiParam {Date} endsAt Event end timestamp (YYYY-MM-DD HH:mm:ss)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} event Created event
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.update = function(req, res) {
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  Event.findById(req.body.id, function(err, event) {
    if (err) return res.send(err);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
	  Thread.findById(event.thread, function(err, thread) {
	  	if (err) return res.send(err);
	  	if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
	  	if (thread.users.indexOf(req.decoded._id) === -1) {
	  		return res.status(403).json({ success: false, message: 'You are not allowed to read these events' });
	  	}
			event.title = req.body.title || event.title;
			event.latitude = req.body.latitude || event.latitude;
			event.longitude = req.body.longitude || event.longitude;
			event.description = req.body.description || event.description;
			event.startsAt = req.body.startsAt || event.startsAt;
			event.endsAt = req.body.endsAt || event.endsAt;
	    event.save(function(err, event) {
	      if (err) return res.send(err);
	      Event.populate(event, [
	      	{ path: 'user', select: 'name picture' },
	      	{ path: 'going', select: 'name picture' },
	      	{ path: 'declined', select: 'name picture' }
	      ], function(err, event) {
	      	if (err) return res.send(err);
	      	res.json({ success: true, data: { event: configureTimestamps(event) } });
	      });
	    });
	  });
  });
};

/**
 * @api {delete} /api/events Delete an existing event
 * @apiName DeleteEvent
 * @apiGroup Event
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Event ID
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} event Created event
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.delete = function(req, res) {
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  Event.findById(req.body.id, function(err, event) {
    if (err) return res.send(err);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
	  Thread.findById(event.thread, function(err, thread) {
	  	if (err) return res.send(err);
	  	if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
	  	if (thread.users.indexOf(req.decoded._id) === -1) {
	  		return res.status(403).json({ success: false, message: 'You are not allowed to read these events' });
	  	}
	  	event.remove(function(err, event) {
	  		if (err) return res.send(err);
    		res.json({ success: true });
	  	});
    });
  });
};

/**
 * @api {put} /api/rsvp-event RSVP to an event
 * @apiName RSVPEvent
 * @apiGroup Event
 *
 * @apiParam {String} token Authentication token
 * @apiParam {String} id Event ID
 * @apiParam {String} rsvp RSVP action; going, declined or empty string (empty string for removing from both lists)
 *
 * @apiSuccess {Boolean} success true
 * @apiSuccess {Object} event Created event
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Error message
 */
exports.rsvp = function(req, res) {
  if (!req.body.id) return res.status(400).json({ success: false, message: 'ID is required' });
  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  if (req.body.rsvp === undefined) return res.status(400).json({ success: false, message: 'RSVP is required' });
  if (req.body.rsvp && req.body.rsvp !== 'going' && req.body.rsvp !== 'declined') {
  	return res.status(400).json({ success: false, message: 'RSVP must be either going or declined' });
  }
  Event.findById(req.body.id, function(err, event) {
    if (err) return res.send(err);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
	  Thread.findById(event.thread, function(err, thread) {
	  	if (err) return res.send(err);
	  	if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
	  	if (thread.users.indexOf(req.decoded._id) === -1) {
	  		return res.status(403).json({ success: false, message: 'You are not allowed to read these events' });
	  	}
	    var goingIndex = event.going.indexOf(req.decoded._id);
			if (goingIndex !== -1) event.going.splice(goingIndex, 1);
	    var declinedIndex = event.declined.indexOf(req.decoded._id);
			if (declinedIndex !== -1) event.declined.splice(declinedIndex, 1);
			if (req.body.rsvp) event[req.body.rsvp].push(req.decoded._id);
	    event.save(function(err, event) {
	      if (err) return res.send(err);
	      Event.populate(event, [
	      	{ path: 'user', select: 'name picture' },
	      	{ path: 'going', select: 'name picture' },
	      	{ path: 'declined', select: 'name picture' }
	      ], function(err, event) {
	      	if (err) return res.send(err);
	      	res.json({ success: true, data: { event: configureTimestamps(event) } });
	      });
	    });
	  });
  });
};
