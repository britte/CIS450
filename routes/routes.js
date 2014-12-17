var api = require('./api.js');
var db = require('../models/tripDB.js');
var _ = require('underscore');

var get_login = function(req, res) { res.render('login.ejs', {}) }

var get_signup = function(req, res) { res.render('signup.ejs', { user: {} }) }

var get_home = function(req, res) {
    var user = req.params.user,
        currentUser = req.session.user || {};

    db.getUser(user, null, function(user, err){
        if (err) {
            res.redirect('/')
        } else {
            // TODO: add friend status logic
            res.render('homepage.ejs', {user: user,
                                        currentUser: currentUser})
        }
    })
}

var get_user_edit = function(req, res) {
    res.render('user-edit.ejs', { user: req.session.user || {}})
}

var get_add_trip = function(req, res) {
    res.render('add-trip.ejs', {})
}

var get_trip = function(req, res) {
    var tid = req.params.trip,
        user = req.session.user;
    db.getTrip(tid, function(trip, err){
        if (err) {
            console.log("Error getting trip: " + err);
            res.json({data: trip, err: !!err, errMsg: err});
        } else {
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
        }
    })
}

var get_trip_edit = function(req, res) {
    var tid = req.params.trip;
    db.getTrip(tid, function(trip, err) {
        if (err) {
            console.log("Error getting trip: " + err);
            res.json({data: trip, err: !!err, errMsg: err});
        } else {
            res.render('trip-edit.ejs', { trip: trip });
        }
    })
}

var routes = {
    login: get_login,
    signup: get_signup,
    homepage: get_home,
    useredit: get_user_edit,
    addtrip: get_add_trip,
    gettrip: get_trip,
    tripedit: get_trip_edit
}

module.exports = routes;