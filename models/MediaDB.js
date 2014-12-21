var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };
var _ = require('underscore');

// ************************************************ //
//                MEDIA LOGIC
// ************************************************ //

var dbPostAlbum = function(uid, tid, name, callback){
    var script = "INSERT INTO albums (id, owner, trip, name, creation_date) " +
                 "SELECT MAX(id) + 1, :1, :2, :3, CURRENT_TIMESTAMP FROM albums";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid, tid, name], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetAlbum = function(aid, callback){
    var script = "SELECT * FROM albums WHERE id=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db: " + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [aid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(results[0], null) }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUserAlbums = function(uid, callback){
     var script = "SELECT * FROM albums WHERE owner=:1";
     oracle.connect(connectData, function(err, connection){
         if (err) { console.log("Error connecting to db: " + err); }
         else {
             console.log("Connected...");
             connection.execute(script, [uid], function(err, results) {
                 if (err) { callback(null, err); }
                 else { callback(results, null)}
                 connection.close();
                 console.log("Connection closed.")
             });
         }
     });
 }

 var dbGetTripAlbums = function(uid, callback){
     var script = "SELECT UNIQUE a.name, a.id, a.id AS OID, " +
                                "o.name AS ONAME, o.login AS OLOGIN, " +
                                "t.name AS TNAME, t.id AS TID " +
                  "FROM participate_trip pt " +
                  "INNER JOIN users u ON (pt.inviter = :1 OR pt.invitee = :1) " +
                  "INNER JOIN trips t ON pt.trip = t.id " +
                  "INNER JOIN albums a ON (a.trip = t.id AND a.owner !=:1) " +
                  "INNER JOIN users o ON o.id = a.owner";
     oracle.connect(connectData, function(err, connection){
         if (err) { console.log("Error connecting to db: " + err); }
         else {
             console.log("Connected...");
             connection.execute(script, [uid], function(err, results) {
                 if (err) { callback(null, err); }
                 else { callback(results, null)}
                 connection.close();
                 console.log("Connection closed.")
             });
         }
     });
 }

var dbPostMedia = function(uid, aid, video, url, private, callback){
    var script = "INSERT INTO media (id, owner, album, upload_date, is_video, media_url, privacy, num_hits) " +
                 "SELECT MAX(id) + 1, :1, :2, CURRENT_TIMESTAMP, :3, :4, :5, :6 FROM media";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            var isVideo = video ? 1 : 0,
                isPrivate = private ? 1 : 0;
            connection.execute(script, [uid, aid, isVideo, url, isPrivate, 0], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetAlbumMedia = function(aid, callback){
    var script =  "SELECT * FROM media WHERE album=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [aid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetMedia = function(mid, callback){
    var script =  "SELECT * FROM media WHERE id=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [mid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results[0], null); }
                connection.close();
                console.log("Connection closed.")
            });
      }
    });
}

var dbAddMediaRating = function(rating, uid, mid, callback){
    var script = "INSERT INTO RATE_MEDIA (rating, rater, media) " +
                 "VALUES (:1, :2, :3)";

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [rating, uid, mid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback({rating: rating}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbAddMediaComment = function(comment, uid, mid, callback){
    var script = "INSERT INTO COMMENT_MEDIA (media_comment, commenter, media, timestamp) " +
                 "VALUES (:1, :2, :3, CURRENT_TIMESTAMP)";

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [comment, uid, mid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback({comment: comment}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetMediaComments = function(mid, callback){
    var script = "SELECT cm.media_comment, u.login AS U_LOGIN, u.name AS U_NAME " +
                 "FROM comment_media cm " +
                 "INNER JOIN users u ON u.id = cm.commenter " +
                 "WHERE cm.media =:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [mid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

 var database = {
   postAlbum: dbPostAlbum,
   getAlbum: dbGetAlbum,
   getUserAlbums: dbGetUserAlbums,
   getTripAlbums: dbGetTripAlbums,
   postMedia: dbPostMedia,
   getAlbumMedia: dbGetAlbumMedia,
   getMedia: dbGetMedia,
   addMediaRating: dbAddMediaRating,
   addMediaComment: dbAddMediaComment,
   getMediaComments: dbGetMediaComments,
};

 module.exports = database;
