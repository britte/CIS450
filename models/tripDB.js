var _ = require('underscore');

var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };

// ************************************************ //
//              LOGIN/SIGNUP LOGIC
// ************************************************ //

var dbGetUserExists = function(login, callback){
    var script = "SELECT * FROM users WHERE login = '" + login + "'";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(results.length > 0, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUser = function(login, pwd, callback){
    var script = "SELECT * FROM users WHERE login = '" + login + (pwd ? ("' AND pwd = '" + pwd + "'") : "'");
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db: " + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, err); }
                else {
                    // If a password was provided, return full user data
                    if (pwd) { callback(results[0], null) }
                    // Otherwise do not return password
                    else { callback(_.omit(results[0], 'PWD')) }
                }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbPostUser = function(user, callback){
    var script = "INSERT INTO users (id, name, pwd, login, affiliation) " +
                 "SELECT MAX(id) + 1, :1, :2, :3, :4  FROM users";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [user.name.toString(),
                                        user.pwd.toString(),
                                        user.login.toString(),
                                        user.affiliation ? user.affiliation.toString() : null], function(err, results) {
                if (err) { callback(null, err); }
                else { callback({uid: results.returnParam}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}


// TODO: improve validation
var dbUpdateUser = function(user, opts, callback){
    var pwdUpdate = opts.old_pwd === user.LOGIN &&
                    opts.new_pwd_1.length > 0 &&
                    opts.new_pwd_2.length > 0 &&
                    (opts.new_pwd_1 === opts.new_pwd_2);
    var script = "UPDATE users " +
                 "SET name=:1, affiliation=:2, pwd=:3 " +
                 "WHERE login=:4";
    var newname = opts["name"] || user.NAME.toString(),
        newaff = opts["affiliation"] || (user.AFFILIATION ? user.AFFILIATION.toString() : null),
        newpwd = (pwdUpdate ? opts["new_pwd_1"] : user.PWD.toString()),
        login = user.LOGIN.toString();
    oracle.connect(connectData, function(err, connection){
        if (err) {
            console.log("Error connecting to db: " + err);
        } else {
            console.log("Connected...");
                connection.execute(script, [newname, newaff, newpwd, login],
                    function(err2, results){
                        if(err2) { callback(null, err2); }
                        else { callback(results[0], null);}
                        connection.close();
                        console.log("connection closed.");
                });
        }
    });
}

// ************************************************ //
//              FRIENDSHIP LOGIC
// ************************************************ //

var dbAddFriend = function(uid, fid, callback){
//    var script = "INSERT ALL " +
//                 "INTO friends (friend_date, friend_1, friend_2, status) VALUES (:1, :2, :3, :4) " +
//                 "INTO friends (friend_date, friend_1, friend_2, status) VALUES (:1, :3, :2, :4) " +
//                 "SELECT * FROM dual";
    var script = "INSERT INTO friends " +
                 "(friend_date, friend_1, friend_2, status) " +
                 "VALUES (:1, :2, :3, :4)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            // TODO: create timestamp logic
            connection.execute(script, [null, uid, fid, 0], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbConfirmFriendRequest = function(uid, rid, callback){
    var add_script = "INSERT INTO friends " +
                     "(friend_date, friend_1, friend_2, status) " +
                     "VALUES (:1, :2, :3, :4)";
        update_script = "UPDATE FRIENDS " +
                        "SET STATUS = 1 " +
                        "WHERE (FRIEND_1 = :1 AND FRIEND_2 = :2)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            console.log(uid)
            console.log(rid)
            connection.execute(add_script, [null, uid, rid, 1], function(err, results) {
                if (err) {
                    callback(null, err);
                    connection.close();
                    console.log("Connection closed.")
                }
            });
            connection.execute(update_script, [rid, uid], function(err, results) {
                if (err) { callback(null, err) }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbRejectFriendRequest = function(uid, rid, callback){
    var script = "DELETE FROM FRIENDS " +
                 "WHERE (FRIEND_1 = :1 AND FRIEND_2 = :2) OR (FRIEND_1 = :2 AND FRIEND_2 = :1)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid, rid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetFriends = function(uid, callback) {
    var script = "SELECT f.name, f.login, f.id FROM users u " +
                 "INNER JOIN friends uf ON uf.friend_1 = u.id " +
                 "INNER JOIN users f ON f.id = uf.friend_2 " +
                 "WHERE (uf.status = 1 AND u.id =:1)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetFriendRequests = function(uid, callback) {
    var script = "SELECT f.name, f.login, f.id FROM users u " +
                 "INNER JOIN friends uf ON uf.friend_2 = u.id " +
                 "INNER JOIN users f ON f.id = uf.friend_1 " +
                 "WHERE (uf.status = 0 AND u.id =:1)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

// ************************************************ //
//              TRIP LOGIC
// ************************************************ //

var dbPostTrip = function(uid, name, callback){
    var script = "INSERT INTO trips (id, owner, start_date, end_date, name) " +
                 "SELECT MAX(id) + 1, :1, :2, :3, :4  FROM trips";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid, null, null, name], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetTrip = function(tid, callback) {
    var script = "SELECT * FROM trips WHERE id=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [tid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results[0], null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUserTrips = function(uid, callback) {
    var script = "SELECT t.id, t.name " +
                 "FROM participate_trip pt " +
                 "INNER JOIN users u ON pt.invitee = u.id " +
                 "INNER JOIN trips t ON pt.trip = t.id " +
                 "WHERE pt.status = 1 AND u.id=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetTripInvites = function(uid, confirmed, callback) {
    var script = "SELECT t.name, t.id " +
                 "FROM participate_trip pt " +
                 "INNER JOIN trips t ON pt.trip = t.id " +
                 "INNER JOIN users u ON pt.invitee = u.id " +
                 "WHERE (pt.status =:1 AND u.id =:2)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            var status = confirmed ? 1 : 0;
            connection.execute(script, [status, uid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetInvitedFriends = function(tid, callback) {
    var script = "SELECT u.name, u.login, u.id, pt.status " +
                 "FROM users u " +
                 "INNER JOIN participate_trip pt ON pt.invitee = u.id " +
                 "INNER JOIN trips t ON t.id = pt.trip " +
                 "WHERE (t.id =:1)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [tid], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbInviteTrip = function(uid, fid, tid, autoconfirm, callback){
    var script = "INSERT INTO PARTICIPATE_TRIP (status, inviter, invitee, trip) " +
                 "VALUES (:1, :2, :3, :4)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            var status = autoconfirm ? 1 : 0;
            console.log("Connected...");
            connection.execute(script, [status, uid, fid, tid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbConfirmInviteRequest = function(tid, uid, callback){
    var script = "UPDATE participate_trip " +
                 "SET STATUS = 1 " +
                 "WHERE (trip =:1 AND invitee =:2)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [tid, uid], function(err, results) {
                if (err) { callback(null, err) }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbRejectInviteRequest = function(tid, uid, callback){
    var script = "DELETE FROM participate_trip " +
                 "WHERE (trip =:1 AND invitee =:2)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [tid, uid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

//var dbGetNewsFeed = function(user, callback){
//    var script = "SELECT M.Media_Url " +
//                 "FROM Users U " +
//                 "INNER JOIN Friends F ON U.ID = F.Friend_1 " +
//                 "INNER JOIN Media M ON M.Owner = F.Friend_2 " +
//                 "WHERE U.ID = :1;"
//    oracle.connect(connectData, function(err, connection){
//        if (err) { console.log("Error connecting to db:" + err); }
//        else {
//            console.log("Connected...");
//            connection.execute(script,
//                               [user1.id],
//                                function(err, results) {
//                                    if (err) { callback(null, "Error getting news feed: " + err); }
//                                    else { callback({user1: user1}, null); }
//                                    connection.close();
//                                    console.log("Connection closed.")
//                                });
//        }
//    });
//}
//
//
//var dbAddMedia = function(media, callback){
//    var script = "INSERT INTO MEDIA (id, owner, upload_date, is_video, media_url, privacy) " +
//                 "SELECT MAX(id) + 1, :1, :2, :3, :4, :5  FROM MEDIA;";
//    oracle.connect(connectData, function(err, connection){
//        if (err) { console.log("Error connecting to db:" + err); }
//        else {
//            console.log("Connected...");
//            connection.execute(script,
//                               [media.owner ? media.owner : null,
//                                media.upload_date ? media.upload.toString() : null,
//                                media.is_video,
//                                media.media_url.toString(),
//                                media.privacy],
//                                function(err, results) {
//                                    if (err) { callback(null, "Error adding media: " + err); }
//                                    else { callback({media: media}, null); }
//                                    connection.close();
//                                    console.log("Connection closed.")
//                                });
//        }
//    });
//}
//
//var dbAddComment = function(comment, is_media, callback){
//    var media_script = "INSERT INTO COMMENT_MEDIA (media_comment, commenter, media) " +
//                        "VALUES (:1, :2, :3)";
//    var trip_script = "INSERT INTO COMMENT_TRIP (trip_comment, commenter, trip) " +
//                        "VALUES (:1, :2, :3)";
//    var script = is_media ? media_script : trip_script;
//
//    oracle.connect(connectData, function(err, connection){
//        if (err) { console.log("Error connecting to db:" + err); }
//        else {
//            console.log("Connected...");
//            connection.execute(script,
//                               [is_media ? comment.media_comment.toString() : comment.trip_comment.toString(),
//                               comment.commenter,
//                               is_media ? comment.media : comment.trip],
//                                function(err, results) {
//                                    if (err) { callback(null, "Error adding comment: " + err); }
//                                    else { callback({comment: comment}, null); }
//                                    connection.close();
//                                    console.log("Connection closed.")
//                                });
//        }
//    });
//
//}
//
//var dbAddRating = function(rating, is_media, callback){
//    var media_script = "INSERT INTO RATE_MEDIA (rating, rater, media) " +
//                        "VALUES (:1, :2, :3)";
//    var trip_script = "INSERT INTO RATE_TRIP (rating, rater, trip) " +
//                        "VALUES (:1, :2, :3)";
//    var script = is_media ? media_script : trip_script;
//
//    oracle.connect(connectData, function(err, connection){
//        if (err) { console.log("Error connecting to db:" + err); }
//        else {
//            console.log("Connected...");
//            connection.execute(script,
//                               [rating.rating,
//                               rating.rater,
//                               is_media ? rating.media : rating.trip],
//                                function(err, results) {
//                                    if (err) { callback(null, "Error adding rating: " + err); }
//                                    else { callback({rating: rating}, null); }
//                                    connection.close();
//                                    console.log("Connection closed.")
//                                });
//        }
//    });
//}

var dbRecommendFriend = function(user, callback){
    var script = "SELECT R.NAME, R.LOGIN " +
                 "FROM USERS U " +
                 "INNER JOIN FRIENDS F ON U.id = F.FRIEND_1 " +
                 "INNER JOIN FRIENDS F2 ON F2.FRIEND_1 = F.FRIEND_2 " +
                 "INNER JOIN USERS R ON R.ID = F2.FRIEND_2 " +
                 "WHERE U.id =:1 AND NOT (U.id = F2.FRIEND_2) AND F.STATUS = 1";
    var id = user.ID;
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [id], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbRecommendLocation = function(user, callback){
    var script = "WITH dream AS ( " + 
                 "SELECT D.location " +
                 "FROM Users U " + 
                 "INNER JOIN DREAMS D ON D.dreamer = U.id " +
                 "WHERE U.id = :1 " +
                 "),friendloc AS (" +
                 "SELECT TT.location " +
                 "FROM Users U " + 
                 "INNER JOIN FRIENDS F ON U.id = F.FRIEND_1 " +
                 "INNER JOIN PARTICIPATE_TRIP PT ON (F.FRIEND_2 = PT.INVITER OR F.FRIEND_2 = PT.INVITEE) " +
                 "INNER JOIN TRIP_TO TT ON TT.trip = PT.trip " +
                 "), allLocations AS ( " +
                 "SELECT * " +
                 "FROM friendloc FL " +
                 "UNION " +
                 "SELECT * " +
                 "FROM dream D " +
                 ") SELECT * " +
                 "FROM allLocations AL " +
                 "GROUP BY AL.location;";

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [user.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error getting location recs: " + err); }
                                    else { callback({location_recs: results}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     
}

//var dbSearch = function(searchTerm, callback){
//    var user_script = "SELECT U.id, U.name " +
//                        "FROM USERS U " +
//                        "WHERE U.name LIKE '%:1%'";
//    var location_script = "SELECT L.id, L.name " +
//                          "FROM LOCATIONS L " +
//                          "WHERE L.name LIKE '%:1%'";
//    var user_res = nil;
//    var location_res = nil;
//
//    oracle.connect(connectData, function(err, connection){
//        if (err) { console.log("Error connecting to db:" + err); }
//        else {
//            console.log("Connected...");
//            connection.execute(user_script,
//                               [searchTerm],
//                                function(err, results) {
//                                    if (err) { callback(null, "Error user search results: " + err); }
//                                    else { user_res = results; }
//                                    connection.close();
//                                    console.log("Connection closed.")
//                                });
//            connection.execute(location_script,
//                                [searchTerm],
//                                function(err, results) {
//                                    if(err) { callback(null, "Error location search results: " + err); }
//                                    else { callback({user_results: user_res, location_results: results}, null); }
//                                    connection.close();
//                                    console.log("connection closed");
//                                });
//        }
//    });
//}

var dbUpdateCachedMedia = function(callback){
    var script = "WITH sortedMedia AS( " +
                 "SELECT * " +
                 "FROM MEDIA M " +
                 "ORDER BY NUM_HITS DESC " +
                 ") SELECT * " +
                 "FROM sortedMedia " +
                 "WHERE ROWNUM <= 3;";

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [user.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error getting media to cache: " + err); }
                                    else { callback({media: results}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     
}

<<<<<<< Updated upstream
var dbUpdateCachedMedia = function(callback){
    var script = "WITH sortedMedia AS( " +
                 "SELECT * " +
                 "FROM MEDIA M " +
                 "ORDER BY NUM_HITS DESC " +
                 ") SELECT * " +
                 "FROM sortedMedia " +
                 "WHERE ROWNUM <= 3;";

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [user.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error getting media to cache: " + err); }
                                    else { callback({media: results}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     
}

=======
>>>>>>> Stashed changes

var database = {
  getUser: dbGetUser,
  getUserExists: dbGetUserExists,
  postUser: dbPostUser,
  updateUser: dbUpdateUser,

  getFriends: dbGetFriends,
  getFriendRecs: dbRecommendFriend,
  postFriendRequest: dbAddFriend,
  getFriendRequests: dbGetFriendRequests,
  confirmFriendRequest: dbConfirmFriendRequest,
  rejectFriendRequest: dbRejectFriendRequest,

  postTrip: dbPostTrip,
  getTrip: dbGetTrip,
  getUserTrips: dbGetUserTrips,
  getTripInvites: dbGetTripInvites,
  getInvitedFriends: dbGetInvitedFriends,
  postTripInvite: dbInviteTrip,
  confirmInviteRequest: dbConfirmInviteRequest,
  rejectInviteRequest: dbRejectInviteRequest,

  updateCache: dbUpdateCachedMedia
};

module.exports = database;
                                        
