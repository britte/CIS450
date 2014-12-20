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
var routes = require('./routes/routes.js');
app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Page fetch routes (load data after html load)
app.get('/', routes.login);
app.get('/login', routes.login);
app.get('/signup', routes.signup);
app.get('/homepage/:user', routes.homepage);
app.get('/user-edit', routes.useredit);

app.get('/add-trip', routes.addtrip);
app.get('/trip/:trip', routes.gettrip);
app.get('/trip-edit/:trip', routes.tripedit)

app.get('/add-album', routes.addalbum);
app.get('/album/:album', routes.album);
app.get('/media/:media', routes.media);


app.get('/friends', api.get_friends);
app.get('/trips', api.get_trips);
app.get('/albums/:trip?', api.get_albums);
app.get('/newsfeed', api.get_news_feed);
app.get('/pending', api.get_pending)


// API routes
app.get('/api/login', api.get_login);
app.post('/api/signup', api.post_user);
app.post('/api/user-edit', api.put_user_update);

app.post('/api/request-friend/:friend', api.post_friend_request);
app.post('/api/respond-friend-request/:requester/:decision?', api.post_update_friend_request);

app.post('/api/posttrip', api.post_trip);
app.post('/api/trip-edit/:trip', api.post_trip_update);
app.post('/api/invite-trip/:trip/:friend', api.post_trip_invite);
app.post('/api/respond-trip-invite/:trip/:decision?', api.post_update_trip_invite);

app.post('/api/postalbum', api.post_album);
app.post('/api/postmedia', api.post_media);
app.post('/api/post-media-rating/:media', api.post_media_rating);
app.post('/api/post-media-comment/:media', api.post_media_comment);
app.post('/api/search', api.get_search);

// listen on port 8081
app.listen(8081);