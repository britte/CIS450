var api = require('./api.js');
var db = require('../models/tripDB.js');
var _ = require('underscore');

var get_login = function(req, res) { res.render('login.ejs', {}) }

var get_signup = function(req, res) { res.render('signup.ejs', { user: {} , err: null}) }

var get_home = function(req, res) {
    var currentUser = req.session.user || res.redirect('/'),
        login = req.params.user;
    if (currentUser && login == currentUser.LOGIN) {
        res.render('homepage.ejs', {user: currentUser,
                                    currentUser: true,
                                    private: false})
    } else {
        db.getUser(login, null, function(user, err){
            if (err) {
                console.log("Error getting user: " + err);
            } else {
                db.getUserPrivacy(currentUser.ID, user.ID, function(private, err){
                    if (err) {
                        res.redirect('/homepage/' + currentUser.LOGIN)
                    } else {
                        res.render('homepage.ejs', {user: user,
                                                    currentUser: false,
                                                    private: private})
                    }
                })
            }
        })
    }
}

var get_user_edit = function(req, res) {
    var user = req.session.user || res.redirect('/');
    res.render('user-edit.ejs', { user: user })
}

var get_add_trip = function(req, res) {
    var user = req.session.user || res.redirect('/');
    res.render('add-trip.ejs', {})
}

var get_trip = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        tid = req.params.trip;
    db.getTrip(tid, function(trip, err){
        if (err) {
            console.log("Error getting trip: " + err);
            res.json({data: trip, err: !!err, errMsg: err});
        } else if (trip) {
            console.log(trip)
            db.getInvitedFriends(tid, function(friends, err){
                if (err) {
                    console.log("Error getting invited friends: " + err);
                    res.json({data: friends, err: !!err, errMsg: err});
                } else {
                    res.render('trip.ejs', {user: user,
                                            trip: trip,
                                            confirmed: _.filter(friends, function(f){ return f.STATUS > 0}),
                                            pending: _.filter(friends, function(f){ return f.STATUS == 0})
                                            })
                }
            })
        } else {
            res.render('error.ejs', {err: 'No such trip exists'})
        }
    })
}

var get_trip_edit = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        tid = req.params.trip;
    db.getTrip(tid, function(trip, err) {
        if (err) {
            console.log("Error getting trip: " + err);
            res.json({data: trip, err: !!err, errMsg: err});
        } else {
            res.render('trip-edit.ejs', { trip: trip });
        }
    })
}

var get_album = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        aid = req.params.album;
    db.getAlbum(aid, function(album, err){
        if (err) {
            console.log("Error getting album: " + err);
            res.json({data: data, err: !!err, errMsg: err});
        } else {
            db.getAlbumMedia(aid, function(media, err){
                 if (err) {
                    console.log("Error getting media: " + err);
                    res.json({data: data, err: !!err, errMsg: err});
                 } else {
                      res.render('album.ejs', {album: album,
                                               media: media,
                                               user: req.session.user})
                 }
            })
        }
    })
}

var get_add_album = function(req, res) {
    var user = req.session.user || res.redirect('/');
    res.render('add-album.ejs', {})
}

var get_media = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        mid = req.params.media;
    db.getMedia(mid, function(media, err){
        if (err) {
            console.log("Error getting media: " + err);
            res.json({data: null, err: !!err, errMsg: err});
        } else {
            db.getMediaComments(mid, function(comments, err){
                if (err) {
                    console.log("Error getting media: " + err);
                    res.json({data: null, err: !!err, errMsg: err});
                } else {
                    res.render('media.ejs', {media: media, comments: comments, user: user})
                }
            });
        }
    });
}

var routes = {
    login: get_login,
    signup: get_signup,
    homepage: get_home,
    useredit: get_user_edit,

    addtrip: get_add_trip,
    gettrip: get_trip,
    tripedit: get_trip_edit,

    addalbum: get_add_album,
    album: get_album,
    media: get_media
}

module.exports = routes;