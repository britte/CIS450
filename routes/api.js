var db = require('../models/tripDB.js');
var mango = require('../models/mongoDB.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/';

var _ = require('underscore');

var get_login = function(req, res) {
    var login = req.query.login,
        pwd = req.query.pwd;
        console.log(req.query)
    db.getUser(login, pwd, function(user, err) {
        if (user) {
        // TODO: swap
            req.session.user = user;
            res.redirect('/homepage/' + user.LOGIN);
        } else {
            res.render('/', { error: err })
        }
    })
}

// Create a new user account
var post_user = function(req, res) {
    var user = req.body;
    if (!user.name || !user.login || !user.pwd) {
        res.json({data: null, err: true, errMsg: 'Invalid data'})
    }
    // Check that username doesn't exist
    db.getUserExists(req.body.login, function(data, err) {
        if (!data) {
            // Validation data
            if (!user.name || !user.login || !user.pwd) {
                res.json({data: null, err: true, errMsg: 'Invalid data'})
            } else {
                // Create user
                db.postUser(user, function(data, err){
                    if (data) {
                        req.session.user = user;
                        res.redirect('/homepage/' + user.login)
                    } else {
                        res.json({data: data, err: !!err, errMsg: err})
                    }
                })
            }
        } else {
            res.json({data: null, err: !!err, errMsg: 'User already exists'})
        }
    });
}

// Edit a user's information
var put_user_update = function(req, res) {
    db.updateUser(req.session.user, req.body, function(data, err){
        if (err){
            console.log("Error updating user: " + err);
            res.json({data: null, err: true, errMsg: 'Invalid data'})
        } else {
            res.redirect('/homepage/' + req.session.user.LOGIN);
        }
    });
}

// ************************************************ //
//                FRIEND LOGIC
// ************************************************ //

// Get all friends for a user
var get_friends = function(req, res) {
    var uid = req.session.user.ID;
    db.getFriends(uid, function(friends, err){
        if (err) {
            console.log("Error finding friends: " + err)
        } else {
            db.getFriendRecs(req.session.user, function(recs, err){
                if(err){
                    console.log("Error getting friend recommendations: " + err);
                } else {
                    res.render('friends.ejs', {friends: friends, recs: recs})
                }
            });
        }
    })
}

// Send a friend request
var post_friend_request = function(req, res) {
    var uid = req.session.user.ID,
        fid = req.params.friend;
    db.postFriendRequest(uid, fid, function(data, err){
        if(err){
            console.log("Error adding friend: " + err);
        } else{
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

// Respond to a friend request
var post_update_friend_request = function(req, res){
    var uid = req.session.user.ID,
        rid = req.params.requester,
        decision = !!req.params.decision;
    if (decision) {
        db.confirmFriendRequest(uid, rid, function(data, err){
            if(err){
                console.log("Error updating friend request: " + err);
            } else {
                res.redirect("/friendrequests");
            }
        });
    } else {
        db.rejectFriendRequest(uid, rid, function(data, err){
            if(err){
                console.log("Error updating friend request: " + err);
            } else {
                res.redirect("/friendrequests");
            }
        });
    }
}

var get_outstanding_requests = function(req, res) {
    var uid = req.session.user.ID;
    db.getFriendRequests(uid, function(data, err){
        if (err) {
            console.log("Error finding invites: " + err)
        } else {
            res.render('requests.ejs', {requests: data})
        }
    })
}

// ************************************************ //
//                TRIP LOGIC
// ************************************************ //

var post_trip = function(req, res){
    var uid = req.session.user.ID,
        name = req.body.name;
    db.postTrip(uid, name, function(data, err){
        if(err){
            console.log("Error creating a trip: " + err);
        } else {
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

var post_trip_update = function(req, res) {
    var tid = req.params.trip,
        name = req.body.name;
    db.updateTrip(tid, name, function(data, err){
        if (err){
            console.log("Error updating user: " + err);
            res.json({data: null, err: true, errMsg: 'Invalid data'})
        } else {
            res.redirect('/trip/' + tid);
        }
    });
}

var get_trips = function(req, res) {
    var uid = req.session.user.ID;
    db.getUserTrips(uid, function(data, err){
        if (err) {
            console.log("Error finding trips: " + err)
        } else {
            res.render('trips.ejs', {trips: data})
        }
    })
}

var post_trip_invite = function(req, res) {
    var uid = req.session.user.ID,
        fid = req.params.friend,
        tid = req.params.trip;
    db.postTripInvite(uid, fid, tid, null, function(data, err){
        if(err){
            console.log("Error inviting friend: " + err);
        } else{
            res.json({data: data, err: !!err, errMsg: err});
        }
    });
}

var get_outstanding_invites = function(req, res) {
    var uid = req.session.user.ID;
    db.getTripInvites(uid, false, function(data, err){
        if (err) {
            console.log("Error finding invites: " + err)
        } else {
            res.render('invites.ejs', {invites: data})
        }
    })
}

var post_update_trip_invite = function(req, res){
    var uid = req.session.user.ID,
        tid = req.params.trip,
        decision = !!req.params.decision;
    if (decision) {
        db.confirmInviteRequest(tid, uid, function(data, err){
            if(err){
                console.log("Error confirming invite request: " + err);
            } else {
                res.redirect("/trip/"+tid);
            }
        });
    } else {
        db.rejectInviteRequest(tid, uid, function(data, err){
            if(err){
                console.log("Error rejecting invite request: " + err);
            } else {
                res.redirect("/trip/"+tid);
            }
        });
    }
}


// ************************************************ //
//                MEDIA LOGIC
// ************************************************ //

var post_album = function(req, res){
    var uid = req.session.user.ID,
        tname = req.body.trip,
        name = req.body.name;
    db.getValidTrip(tname, function(trip, err) {
        if (err) {
            console.log("Error creating album: " + err)
            res.json({data: trip, err: !!err, errMsg: err});
        } else {
            // Only create album if a trip exists
            if (trip) {
                db.postAlbum(uid, trip.ID, name, function(data, err){
                    if (err) {
                        console.log("Error creating album: " + err)
                        res.json({data: data, err: !!err, errMsg: err});
                    } else {
                        redirect("/albums", {});
                    }
                })
            } else {
                var err = 'Trip does not exist.'
                console.log("Error creating album: " + err )
                res.json({data: data, err: !!err, errMsg: err});
            }
        }
    })
}

var get_albums = function(req, res) {
    var uid = req.session.user.ID,
        tid = req.params.trip;
    db.getUserAlbums(uid, function(userAlbums, err){
        if (err) {
            console.log("Error fetching user albums: " + err)
        } else {
            db.getTripAlbums(uid, function(tripAlbums, err){
                if(err){
                    console.log("Error fetching trip albums: " + err);
                } else {
                    console.log(tripAlbums)
                    res.render('albums.ejs', {trip: tripAlbums, user: userAlbums})
                }
            });
        }
    })
}

var post_media = function(req, res){
    var uid = req.session.user.ID,
        aid = req.body.album,
        url = req.body.url,
        video = !!req.body.video,
        private = !!req.body.private;
    db.postMedia(uid, aid, video, url, private, function(trip, err) {
        if (err) {
            console.log("Error adding media album: " + err)
            res.json({data: trip, err: !!err, errMsg: err});
        } else {
            res.redirect("/album/" + aid);
        }
    })
}


//var add_media = function(req, res){
//    var
//    db.addMedia(req.body.media, function(data, err){
//        if(err) {
//            console.log("Error adding media: ");
//        } else {
//            res.json({data: data, err: !!err, errMsg: err});
//        }
//    });
//}

//var get_news_feed = function(req, res){
//    db.getNewsFeed(req.body, function(data, err){
//        if(err){
//            console.log("error getting news feed");
//        } else {
//            res.json({data: data, err: !!err, errMsg: err});
//        }
//    });
//}
//
//var add_comment = function(req, res){
//    db.addComment(req.body.comment, req.body.is_media, function(data, err){
//        if(err){
//            var type = req.body.is_media ? "media" : "trip";
//            console.log("error adding comment to " + type);
//        } else {
//            res.json({data: data, err: !!err, errMsg: err});
//        }
//    });
//}
//
//var add_rating = function(req, res){
//    db.addRating(req.body.rating, req.body.is_media, function(data, err){
//        if(err) {
//            var type = req.body.is_media ? "media" : "trip";
//            console.log("error adding rating to " + type);
//        } else {
//            res.json({data: data, err: !!err, errMsg: err});
//        }
//    });
//}

var update_cache = function(req, res){
    db.updateCache(function(data, err){
        if(err){
            console.log("error updating cache");
        } else {
            var cacheMap = {};
            cacheMap["first"] = [data[0].id, data[0].media_url];
            cacheMap["second"] = [data[1].id, data[1].media_url];
            cacheMap["third"] = [data[2].id, data[2].media_url];
            if(req.body.first_time){
                MongoClient.connect(url, {native_parser:true}, function(err, mangodb) {
                    if(err){
                        console.log("error with mongo client for inserting");
                    } else {
                        mango.insertTrio(mangodb, cacheMap, function(results){
                            if(!results){
                                console.log("error inserting trio");
                            } else {
                                console.log("trio inserted successfully");
                            }
                        });
                    }
                });
            } else {
                MongoClient.connect(url, {native_parser:true}, function(err, mangodb){
                    if(err){
                        console.log("error with mongo client for updating");
                    } else {
                        var docs = nil;
                        mango.getAll(db, function(results){
                            docs = results;
                        });
                        mango.update(mangodb, docs[0], data[0], function(results){
                            if(!results){
                                console.log("error updating");
                            } else {
                                console.log("updated correctly");
                            }
                        });
                    }
                });
            }
        }
    });
}

//var recommend_location = function(req, res){
//    db.recommendLocation(req.body.user, function(data, err){
//        if(err){
//            console.log("error getting location recs");
//        } else {
//            res.json(data: data, err: !!err, errMsg: err);
//        }
//    });
//}
//
//var search = function(req, res){
//    db.search(req.body.searchTerm, function(data, err){
//        if(err) {
//            console.log("error during user/location search");
//        } else {
//            res.json(data: data, err: !!err, errMsg: err);
//        }
//    });
//}



var api = {
    get_login: get_login,
    post_user: post_user,
    put_user_update: put_user_update,

    get_friends: get_friends,
    post_friend_request: post_friend_request,
    post_update_friend_request: post_update_friend_request,
    get_outstanding_requests: get_outstanding_requests,

    post_trip: post_trip,
    post_trip_update: post_trip_update,
    get_trips: get_trips,
    post_trip_invite: post_trip_invite,
    post_update_trip_invite: post_update_trip_invite,
    get_outstanding_invites: get_outstanding_invites,

    post_album: post_album,
    get_albums: get_albums,
    post_media: post_media,
//    get_news_feed: get_news_feed
};

module.exports = api;
