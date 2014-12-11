var db = require('../models/tripDB.js');

var get_user = function(req, res) {
    var login = req.params.login,
        pwd = req.params.pwd;
    db.getUser(login, pwd, function(data, err) {
        res.json({data: data.users, err: !!err, errMsg: err})
    })
}
//
//var get_users = function(req, res) {
//    db.getUsers(username, function(data, err) {
//        res.json({user: data, err: !!err, errMsg: err})
//    })
//}

// Create a new user account
var post_user = function(req, res) {
    // Check that username doesn't exist
    db.getUserExists(req.body.login, function(data, err) {
        if (!data) {
            // Validation data
            if (!req.body.name || !req.body.login || !req.body.pwd) {
                res.json({data: null, err: true, errMsg: 'Invalid data'})
            } else {
                // Create user
                db.postUser(req.body, function(data, err){
                    res.json({data: data, err: !!err, errMsg: err})
                })
            }
        } else {
            res.json({data: null, err: !!err, errMsg: 'User already exists'})
        }
    });
}

var update_user = function(req, res) {
    db.updateUser(req.body.user, req.body.opts, function(data, err){
        if (err){
            console.log("error updating user");
        } else {
            console.log("this updaet worked yo!");
        }
    });
}

var post_trip = function(req, res){
    db.post_trip(req.body, function(data, err){
        if(err){
            console.log("error creating a trip");
        } else {
            res.json({data: data, err: !!err, errMsg: err});    
        }
    });
}

var add_friend = function(req, res){
    db.addFriend(req.params.user1, req.params.user2, function(data, err){
        if(err){
            console.log("Error adding friend");
        } else{
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

var respond_to_friend_request = function(req, res){
    db.updateFriend(req.params.user1, req.params.user2, req.params.decision, function(data, err){
        if(err){
            console.log("error updating friend request");
        } else {
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

var get_news_feed = function(req, res){
    db.getNewsFeed(req.body, function(data, err){
        if(err){
            console.log("error getting news feed");
        } else {
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

var invite_to_trip = function(req, res){
    db.inviteTrip(req.params.user1, req.params.user2, req.params.trip function(data, err){
        if(err){
            console.log("error inviting to trip");
        } else {
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

var respond_to_trip_invite = function(req, res){
    db.updateTripInvite(req.body.user1, req.body.user2, req.body.trip, req.body.decision, function(data, err){
        if(err){
            console.log("error updating invite");
        } else {
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

//var get_users = function(req, res) {
//    db.users(function(data, err) {
//        if (err) {
//            console.log('fuck it')
//        } else if (data) {
//            res.json(data);
//        } else {
//            res.redirect('/error/?error=logout');
//        }
//    });
//}

var api = {
    get_user: get_user,
    post_user: post_user
};

module.exports = api;
