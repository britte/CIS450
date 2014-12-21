var db = require('../../models/MediaDB.js');
var tripdb = require('../../models/tripDB.js');
var _ = require('underscore');

// ************************************************ //
//                MEDIA LOGIC
// ************************************************ //

var post_album = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        tname = req.body.trip,
        name = req.body.name;
    tripdb.getValidTrip(tname, function(trip, err) {
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
                        console.log(trip.ID)
                        res.json({id: trip.ID})
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

var get_album = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        aid = req.params.id;
    db.getAlbum(aid, function(album, err){
        if (err) {
            res.status(500).send({msg: "Error getting album: " + err });
        } else {
            db.getAlbumMedia(aid, function(media, err){
                 if (err) {
                    console.log("Error getting media: " + err);
                       res.json({data: data, err: !!err, errMsg: err});
                 } else {
                      res.json({ album: album, media: media })
                 }
            })
        }
    })
}

var get_albums = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getUserAlbums(uid, function(userAlbums, err){
        if (err) {
            res.status(500).send({ msg : "Error fetching user's albums: " + err });
        } else {
            db.getTripAlbums(uid, function(tripAlbums, err){
                if(err){
                    res.status(500).send({ msg : "Error fetching user's trip albums: " + err });
                } else {
                    res.json({trip: tripAlbums, user: userAlbums})
                }
            });
        }
    })
}

var get_media = function(req, res) {
    var user = req.session.user || res.redirect('/'),
        mid = req.params.id;
    db.getMedia(mid, function(media, err){
        if (err) {
            res.status(500).send({ msg : "Error fetching user's media: " + err });
        } else {
            db.getMediaComments(mid, function(comments, err){
                if (err) {
                    res.status(500).send({ msg : "Error fetching media comments: " + err });
                } else {
                    res.json({media: media, comments: comments})
                }
            });
        }
    });
}

var post_media = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID,
        aid = req.params.album,
        url = req.body.url,
        video = req.body.video,
        private = req.body.private;

    db.postMedia(uid, aid, video, url, private, function(trip, err) {
        if (err) {
            res.status(500).send({ msg : "Error adding media to album: " + err });
        } else {
            res.sendStatus(200);
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
            res.status(500).send({ msg : "Error rating media: " + err });
        } else {
            res.sendStatus(200)
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
            res.status(500).send({ msg : "Error commenting media: " + err });
        } else {
            res.sendStatus(200)
        }
    });
}

var api = {
    post_album: post_album,
    get_album: get_album,
    get_albums: get_albums,
    get_media: get_media,
    post_media: post_media,
    post_media_rating: post_media_rating,
    post_media_comment: post_media_comment
};

module.exports = api;