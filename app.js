var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

var api = require('./routes/api.js');
var trip_api = require('./routes/api/trip-api.js');
var friend_api = require('./routes/api/friend-api.js');
var media_api = require('./routes/api/media-api.js');
var routes = require('./routes/routes.js');
app.use(express.static(__dirname + '/public'));

// Because fuck ejs tho
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


//// API routes
app.get('/api/session', api.get_session);
app.post('/api/signup', api.post_user);
app.get('/api/login/:login/:pwd', api.get_login);
app.get('/api/logout', api.get_logout);
app.get('/api/user/:login', api.get_user);
app.post('/api/user-edit', api.put_user_update);

// Friend API
app.get('/api/friends', friend_api.get_friends);
app.get('/api/friend-recs', friend_api.get_friend_recs);
app.post('/api/request-friend/:friend', friend_api.post_friend_request);
app.post('/api/reject-request/:friend', friend_api.reject_friend_request);
app.post('/api/confirm-request/:friend', friend_api.confirm_friend_request);

// Trip API
app.post('/api/post-trip', trip_api.post_trip);
app.post('/api/post-trip-edit/:id', trip_api.post_trip_update);
app.get('/api/trip/:id', trip_api.get_trip);
app.get('/api/trip-invited/:id', trip_api.get_trip_invited)
app.get('/api/trips', trip_api.get_trips);
app.post('/api/invite-trip/:trip/:friend', trip_api.post_trip_invite);
app.post('/api/reject-invite/:trip/:friend', trip_api.reject_trip_invite);
app.post('/api/confirm-invite/:trip/:friend', trip_api.confirm_trip_invite);

// Media API
app.get('/album/:id', media_api.get_album);
app.get('/media/:id', media_api.get_media);
app.get('/api/albums/:trip?', media_api.get_albums);
app.post('/api/post-album', media_api.post_album);
app.post('/api/post-media/:album', media_api.post_media);
app.post('/api/post-media-rating/:media', media_api.post_media_rating);
app.post('/api/post-media-comment/:media', media_api.post_media_comment);

//
app.get('/api/pending', api.get_pending)
app.get('/api/newsfeed/:login', api.get_news_feed)
//
//app.post('/api/search', api.get_search);

// Page fetch routes (load data after html load)
app.get('/login', routes.login)
app.get('/signup', routes.signup)
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

// listen on port 8081
app.listen(8081);