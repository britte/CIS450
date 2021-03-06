var db = require('../../models/FriendDB.js');
var _ = require('underscore');

// ************************************************ //
//                FRIEND API
// ************************************************ //

// Get all friends for a user
var get_friends = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getFriends(uid, function(friends, err){
        if (err) {
            console.log("Error finding friends: " + err)
        } else {
            res.json(friends)
        }
    })
}

var get_friend_recs = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getFriendRecs(uid, function(recs, err){
        if(err){
            console.log("Error getting friend recommendations: " + err);
        } else {
            res.json(recs)
        }
    });
}

// Send a friend request
var post_friend_request = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        fid = req.params.friend;
    db.postFriendRequest(uid, fid, function(data, err){
        if(err){
            res.status(500).send({ msg: "Error adding friend: " + err });
        } else{
            res.sendStatus(200);
        }
    });
}

var confirm_friend_request = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        rid = req.params.friend;

    db.confirmFriendRequest(uid, rid, function(data, err){
        if(err){
            res.status(500).send({ msg : "Error confirming friend request: " + err});
        } else {
            res.sendStatus(200)
        }
    });
}

var reject_friend_request = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        rid = req.params.friend;

    db.rejectFriendRequest(uid, rid, function(data, err){
        if(err){
            res.status(500).send({ msg : "Error rejecting friend request: " + err});
        } else {
            res.sendStatus(200)
        }
    });
}

var get_friend_trips = function(req, res){
   var user = req.session.user || res.redirect('/'),
       uid = user.ID;

       console.log('in api')

   db.getFriendTrips(uid, function(data, err){
       if(err){
            console.log(err)
           res.status(500).send({ msg : "Error getting friend trips: " + err});
       } else {
           res.json(data)
       }
   });
}

var api = {
    get_friends: get_friends,
    get_friend_recs: get_friend_recs,
    post_friend_request: post_friend_request,
    confirm_friend_request: confirm_friend_request,
    reject_friend_request: reject_friend_request,
    get_friend_trips: get_friend_trips,
};

module.exports = api;