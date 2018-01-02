var jwt = require('jsonwebtoken');
var multer  = require('multer');
var upload = multer({ dest: './public/uploads' });

var Session = require('./models/Session');
var User = require('./models/User');
var Save = require('./models/Save');
var Tag = require('./models/Tag');
var Follow = require('./models/Follow');
var Post = require('./models/Post');
var Reaction = require('./models/Reaction');
var Review = require('./models/Review');
var Comment = require('./models/Comment');
var Notification = require('./models/Notification');
var Static = require('./models/Static');

var sessions = require('./api/controllers/SessionController');
var users = require('./api/controllers/UserController');
var saves = require('./api/controllers/SaveController');
var tags = require('./api/controllers/TagController');
var follows = require('./api/controllers/FollowController');
var posts = require('./api/controllers/PostController');
var reactions = require('./api/controllers/ReactionController');
var reviews = require('./api/controllers/ReviewController');
var comments = require('./api/controllers/CommentController');
var notifications = require('./api/controllers/NotificationController');
var statics = require('./api/controllers/StaticController');

function verifyToken(req, res, next) {
  var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'];
  if (!token) return res.status(400).json({ success: false, message: 'Authentication failed' });
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) return res.status(401).json({ success: false, message: 'Authentication failed' });
    Session.findOne({ user: decoded._id, token: token }, function(err, session) {
      if (err) return res.send(err);
      if (!session) return res.status(401).json({ success: false, message: 'Authentication failed' });
	    User.findById(decoded._id, function(err, user) {
	      if (err) return res.send(err);
	      if (!user) return res.status(401).json({ success: false, message: 'Authentication failed' });
	      req.decoded = user;
	      next();
	    });
    })
  });
}

module.exports = function(app) {
	/* ------ */
	/* SHARED */
	/* ------ */

	// Session
	app.post('/api/sign-in', sessions.signIn);
	app.post('/api/facebook-sign-in', sessions.facebookSignIn);
	app.delete('/api/sign-out', verifyToken, sessions.signOut);

	/* --------- */
	/* FRONT-END */
	/* --------- */

	// User
	app.post( '/api/sign-up', upload.single('picture'), users.validateNewUser, users.signUp);
	app.post('/api/resend-confirmation', users.resendConfirmation);
	app.post('/api/confirm-user', users.confirmUser);
	app.post('/api/contact-business', verifyToken, users.contactBusiness);
	app.post('/api/reset-password', users.resetPassword);
	app.get('/api/search', users.search);
	app.get('/api/read-profile', verifyToken, users.read);
	app.put('/api/update-profile', upload.single('picture'), verifyToken, users.validateExistingUser, users.update);
	app.put('/api/change-password', verifyToken, users.changePassword);

	// Save
	app.get('/api/saves', verifyToken, saves.list);
	app.post('/api/saves', verifyToken, saves.create);
	app.delete('/api/saves', verifyToken, saves.delete);

	// Tag
	app.get('/api/list-tags', tags.list);

	// Follow
	app.get('/api/follows', verifyToken, follows.list);
	app.post('/api/follow', verifyToken, follows.follow);
	app.put('/api/accept', verifyToken, follows.accept);
	app.delete('/api/reject', verifyToken, follows.reject);
	app.delete('/api/unfollow', verifyToken, follows.delete);

	// Post
	app.get('/api/feed', verifyToken, posts.feed);
	app.get('/api/posts', verifyToken, posts.list);
	app.post('/api/posts', upload.array('pictures'), verifyToken, posts.validateNewPost, posts.create);
	app.get('/api/post', verifyToken, posts.read);
	app.put('/api/posts', upload.array('pictures'), verifyToken, posts.validateExistingPost, posts.update);
	app.delete('/api/posts', verifyToken, posts.delete);

	// Reaction
	app.post('/api/reactions', verifyToken, reactions.create);
	app.put('/api/reactions', verifyToken, reactions.update);
	app.delete('/api/reactions', verifyToken, reactions.delete);

	// Review
	app.get('/api/reviews', reviews.list);
	app.post('/api/reviews', verifyToken, reviews.create);
	app.put('/api/reviews', verifyToken, reviews.update);
	app.delete('/api/reviews', verifyToken, reviews.delete);

	// Comment
	app.post('/api/comments', verifyToken, comments.create);
	app.put('/api/comments', verifyToken, comments.update);
	app.delete('/api/comments', verifyToken, comments.delete);

	// Notification
	app.get('/api/notifications', verifyToken, notifications.list);

	// Static
	app.get('/api/statics', verifyToken, statics.list);

	/* ----- */
	/* ADMIN */
	/* ----- */

	// Tag
	app.get('/api/tags', verifyToken, tags.list);
	app.post('/api/tags', verifyToken, tags.create);
	app.get('/api/tags/:id', verifyToken, tags.read);
	app.put('/api/tags/:id', verifyToken, tags.update);
	app.delete('/api/tags/:id', verifyToken, tags.delete);

	// Static
	app.get('/api/statics', verifyToken, statics.list);
	app.post('/api/statics', verifyToken, statics.create);
	app.get('/api/statics/:id', verifyToken, statics.read);
	app.put('/api/statics/:id', verifyToken, statics.update);
	app.delete('/api/statics/:id', verifyToken, statics.delete);
}