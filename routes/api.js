var db = require('../models/tripDB.js');
var mango = require('../models/mongoDB.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/';

var _ = require('underscore');

var get_login = function(req, res) {
    var login = req.query.login,
        pwd = req.query.pwd;
    db.getUser(login, pwd, function(user, err) {
        if (user) {
            req.session.user = user;
            res.redirect('/homepage/' + user.LOGIN);
        } else {
            res.redirect('/')
        }
    })
}

var get_logout = function(req, res) {
    req.session.user = null;
    res.redirect('/');
}

// Create a new user account
var post_user = function(req, res) {
    var user = req.body;
    if (!user.name || !user.login || !user.pwd) {
        res.render('signup.ejs', {err: 'Invalid data'})
    }
    // Check that username doesn't exist
    db.getUserExists(user.login, function(data, err) {
        if (!data) {
            // Create user
            db.postUser(user, function(data, err){
                if (data) {
                    req.session.user = user;
                    res.redirect('/homepage/' + user.login)
                } else {
                    res.render('signup.ejs', {err: err})
                }
            })
        } else {
            res.render('signup.ejs', {err: 'User already exists'})
        }
    });
}

// Edit a user's information
var put_user_update = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        pwdUpdate = (req.body.old_pwd === user.PWD &&
                     req.body.new_pwd_1.length > 0 &&
                     req.body.new_pwd_2.length > 0 &&
                     (req.body.new_pwd_1 === req.body.new_pwd_2)),
        pwd = (pwdUpdate ? req.body.new_pwd_1 : user.PWD.toString()),
        name = req.body.name || user.NAME.toString(),
        aff = req.body.affiliation || (user.AFFILIATION ? user.AFFILIATION.toString() : null),
        uid = user.ID;
    db.updateUser(uid, name, pwd, aff, function(data, err){
        if (err){
            console.log("Error updating user: " + err);
            res.json({data: null, err: true, errMsg: 'Invalid data'})
        } else {
            // Update session cookie
            req.session.user.AFFILIATION = aff;
            req.session.user.PWD = pwd;
            req.session.user.NAME = name;
            res.redirect('/homepage/' + user.LOGIN);
        }
    });
}

// ************************************************ //
//                FRIEND LOGIC
// ************************************************ //

// Get all friends for a user
var get_friends = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        rid = req.params.requester,
        decision = !!req.params.decision;
    if (decision) {
        db.confirmFriendRequest(uid, rid, function(data, err){
            if(err){
                console.log("Error updating friend request: " + err);
            } else {
                res.redirect("/pending");
            }
        });
    } else {
        db.rejectFriendRequest(uid, rid, function(data, err){
            if(err){
                console.log("Error updating friend request: " + err);
            } else {
                res.redirect("/pending");
            }
        });
    }
}

var get_outstanding_requests = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        name = req.body.name,
        location = req.body.location;
    db.getValidLocation(location, function(loc, err){
        console.log(loc)
        if(err){
            console.log("Error finding location: " + err);
            res.json({data: null, err: !!err, errMsg: err});
        } else if (!loc) {
            db.postLocation(location, function(locId, err){
                if(err){
                    console.log("Error creating a location: " + err);
                    res.json({data: null, err: !!err, errMsg: err});
                } else {
                    db.postTrip(uid, name, locId, function(tripId, err){
                        if(err){
                            console.log("Error creating a trip: " + err);
                            res.json({data: null, err: !!err, errMsg: err});
                        } else {
                            db.postTripTo(tripId, locId, function(data, err){
                                if(err){
                                    console.log("Error creating a trip: " + err);
                                    res.json({data: null, err: !!err, errMsg: err});
                                } else {
                                    res.redirect('/trip/'+tripId);
                                }
                            });
                        }
                    });
                }
            })
        } else {
            db.postTrip(uid, name, loc.ID, function(tripId, err){
                if(err){
                    console.log("Error creating a trip: " + err);
                    res.json({data: null, err: !!err, errMsg: err});
                } else {
                    db.postTripTo(tripId, loc.ID, function(data, err){
                        if(err){
                            console.log("Error creating a trip: " + err);
                            res.json({data: null, err: !!err, errMsg: err});
                        } else {
                            res.redirect('/trip/'+tripId);
                        }
                    });
                }
            });
        }
    })
}

var post_trip_update = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        tid = req.params.trip,
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getUserTrips(uid, function(data, err){
        if (err) {
            console.log("Error finding trips: " + err)
        } else {
            res.render('trips.ejs', {trips: data, user: user})
        }
    })
}

var post_trip_invite = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getTripInvites(uid, false, function(data, err){
        if (err) {
            console.log("Error finding invites: " + err)
        } else {
            res.render('invites.ejs', {invites: data})
        }
    })
}

var post_update_trip_invite = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
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
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
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

var post_media_rating = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        mid = req.params.media,
        rating = req.body.rating;
    db.addMediaRating(rating, uid, mid, function(data, err){
        if(err) {
            console.log("Error adding rating: " + err);
            res.json({data: data, err: !!err, errMsg: err});
        } else {
            res.redirect("/media/"+mid)
        }
    });
}

var post_media_comment = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        mid = req.params.media,
        comment = req.body.comment;
    db.addMediaComment(comment, uid, mid, function(data, err){
        if(err) {
            console.log("Error adding comment: " + err);
            res.json({data: data, err: !!err, errMsg: err});
        } else {
            res.redirect("/media/"+mid)
        }
    });
}

var get_news_feed = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getNewsFeed(uid, function(data, err){
        if(err){
            console.log("Error getting news feed");
        } else {
            res.json({feed: data})
        }
    });
}

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

var get_pending = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getAllPending(uid, false, function(data, err){
        if(err) {
            console.log("Error getting pending: " + err);
            res.json({data: data, err: !!err, errMsg: err});
        } else {
            console.log(data)
            res.render("pending.ejs", { user : user,
                                        friends : _.filter(data, function(f){ return f.TYP == 'friend' }),
                                        trip : _.filter(data, function(f){ return f.TYP == 'trip' })
                                      })

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
var search = function(req, res){
   db.search(req.body.searchTerm, function(data, err){
       if(err) {
           console.log("error during user/location search");
       } else {
           res.json({data: data, err: !!err, errMsg: err});
       }
   });
}



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
    post_media_rating: post_media_rating,
    post_media_comment: post_media_comment,
    get_news_feed: get_news_feed,
    get_pending: get_pending,
    get_search: search
};

module.exports = api;
