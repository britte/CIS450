var db = require('../../models/TripDB.js');
var _ = require('underscore');

// ************************************************ //
//                TRIP API
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
        tid = req.params.id,
        name = req.body.name;
    db.updateTrip(tid, name, function(data, err){
        if (err){
            res.status(500).send({ msg: "Error updating user: " + err });
        } else {
            res.status(200);
        }
    });
}

var get_trips = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getUserTrips(uid, function(trips, err){
        if (err) {
            res.status(500).send({ msg: "Error finding trips: " + err });
        } else {
            res.json(trips);
        }
    })
}

var get_trip = function(req, res) {
    var user = req.session.user,
        tid = req.params.id;
    db.getTrip(tid, function(trip, err){
        if (err) {
            res.status(500).send({ msg: 'Error fetching trip' });
        } else if (trip) {
            res.json(trip)
        } else {
            res.status(500).send({ msg: 'No such trip exists' });
        }
    })
}

var get_trip_invited = function(req, res) {
    var tid = req.params.id;
    db.getInvitedFriends(tid, function(friends, err){
        if(err){
            res.status(500).send({ msg: "Error getting friends: " + err });
        } else {
            res.json(friends);
        }
    });
}

var post_trip_invite = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        fid = req.params.friend,
        tid = req.params.trip;
    db.postTripInvite(uid, fid, tid, null, function(data, err){
        if(err){
            res.status(500).send({ msg: "Error inviting friend: " + err });
        } else{
            res.send(200);
        }
    });
}

var reject_trip_invite = function(req, res) {
    var fid = req.params.friend,
        tid = req.params.trip;
    db.rejectInviteRequest(tid, fid, function(data, err){
        if(err){
            res.status(500).send({ msg: "Error rejecting invite: " + err });
        } else{
            res.send(200);
        }
    });
}

var confirm_trip_invite = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        tid = req.params.trip;
    db.confirmInviteRequest(tid, uid, function(data, err){
        if(err){
            res.status(500).send({ msg: "Error confirming invite request: " + err });
        } else {
            res.send(200);
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


var api = {
    post_trip: post_trip,
    post_trip_update: post_trip_update,
    get_trip: get_trip,
    get_trips: get_trips,
    get_trip_invited: get_trip_invited,
    post_trip_invite: post_trip_invite,
    reject_trip_invite: reject_trip_invite,
    confirm_trip_invite: confirm_trip_invite,
//    get_outstanding_invites: get_outstanding_invites,
};

module.exports = api;