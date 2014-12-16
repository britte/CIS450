var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };

var dbGetUserExists = function(login, callback){
    var script = "SELECT * FROM users WHERE login = '" + login + "'";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, "Error fetching users:" + err); }
                else { callback(results.length > 0, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUser = function(login, pwd, callback){
    var script = "SELECT * FROM users where login = '" + login + "' AND pwd = '" + pwd + "'";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, "Error fetching users:" + err); }
                else { callback({users: results}, null); }
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
                if (err) { callback(null, "Error creating user: " + err); }
                else { callback({uid: results.returnParam}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbUpdateUser = function(user, opts, callback){
    var script = "UPDATE USERS " +
                  "SET NAME= :1, PWD= :2, AFFILIATION= :3" +
                  "WHERE LOGIN=:4;";
    var newname = opts["name"] ? opts["name"] : user.name.toString();
    var newpwd = opts["pwd"] ? opts["pwd"] : user.pwd.toString();
    var newaff = opts["affiliation"] ? opts["affiliation"] : user.affiliation.toString();
    oracle.connect(connectData, function(err, connection){
        if(err){
            console.log("Error connecting to db: " + err);
        } else {
            console.log("Connected..."):
            connection.execute(script,
                                [newname, newpwd, newaff, user.login.toString()], 
                                function(err2, results){
                                            if(err2) { 
                                                callback(null, "Error updating user " + err);
                                            } else {
                                                callback({user: user}, null);
                                            }
                                            connect.close();
                                            console.log("connection closed.");
                                });
        }
    });
}

var dbAddFriend = function(user1, user2, callback){
    var script = "INSERT ALL " +
                "INTO friends (friend_date, friend_1, friend_2, status) VALUES (:1, :2, :3, :4) " +
                "INTO friends (friend_date, friend_1, friend_2, status) VALUES (:1, :3, :2, :4) " +
                "SELECT * FROM dual;";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [new Date().getTime(), user1.id, user2.id, 0, ],
                                function(err, results) {
                                    if (err) { callback(null, "Error adding friend: " + err); }
                                    else { callback({user1: user1, user2: user2}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });
}

var dbRespondToFriendRequest = function(user1, user2, decision, callback){
    var yes_script = "UPDATE FRIENDS " +
                 "SET STATUS = 1 " +
                 "WHERE (FRIEND_1 = :1 AND FRIEND_2 = :2) OR (FRIEND_1 = :2 AND FRIEND_2 = :1); ";
    var no_script = "DELETE FROM FRIENDS " +
                    "WHERE (FRIEND_1 = :1 AND FRIEND_2 = :2) OR (FRIEND_1 = :2 AND FRIEND_2 = :1);";
    var script = decision ? yes_script : no_script;
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [user1.id, user2.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error updating friend request: " + err); }
                                    else { callback({user1: user1, user2: user2}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });
}

var dbPostTrip = function(trip, callback){
    var script = "INSERT INTO trips (id, owner, start_date, end_date, name) " +
                 "SELECT MAX(id) + 1, :1, :2, :3, :4  FROM trips;";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [trip.owner ? trip.owner.toString() : null,
                                        trip.start_date ? trip.start_date.toString() : null,
                                        trip.end_date ? trip.end_date.toString() : null,
                                        trip.name ? trip.name.toString() : null], function(err, results) {
                if (err) { callback(null, "Error creating trip: " + err); }
                else { callback({uid: results.returnParam}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetNewsFeed = function(user, callback){
    var script = "SELECT M.Media_Url " +
                 "FROM Users U " +
                 "INNER JOIN Friends F ON U.ID = F.Friend_1 " +
                 "INNER JOIN Media M ON M.Owner = F.Friend_2 " +
                 "WHERE U.ID = :1;"
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [user1.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error getting news feed: " + err); }
                                    else { callback({user1: user1}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    }); 
}

var dbInviteTrip = function(user1, user2, trip, callback){
    var script = "INSERT INTO PARTICIPATE_TRIP (status, inviter, invitee, trip) " +
                 "VALUES (:1, :2, :3, :4);";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [0, user1.id, user2.id, trip.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error inviting to trip: " + err); }
                                    else { callback({user1: user1, user2: user2, trip: trip}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    }); 
}

var dbRespondToTripInvite = function(user1, user2, trip, decision, callback){
    var yes_script = "UPDATE PARTICIPATE_TRIP"  +
                     "SET STATUS = 1 " + 
                     "WHERE INVITER = :1 AND INVITEE = :2 AND TRIP = :3;";
    var no_script = "DELETE FROM PARTICIPATE_TRIP " +
                    "WHERE INVITER = 1 AND INVITEE = 2 AND TRIP = 2;";
    var script = decision ? yes_script : no_script;

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [0, user1.id, user2.id, trip.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error responding to trip invite: " + err); }
                                    else { callback({user1: user1, user2: user2, trip: trip}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     
}

var dbAddMedia = function(media, callback){
    var script = "INSERT INTO MEDIA (id, owner, upload_date, is_video, media_url, privacy) " +
                 "SELECT MAX(id) + 1, :1, :2, :3, :4, :5  FROM MEDIA;";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [media.owner ? media.owner : null,
                                media.upload_date ? media.upload.toString() : null, 
                                media.is_video,
                                media.media_url.toString(),
                                media.privacy],
                                function(err, results) {
                                    if (err) { callback(null, "Error adding media: " + err); }
                                    else { callback({media: media}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     
}

var dbAddComment = function(comment, is_media, callback){
    var media_script = "INSERT INTO COMMENT_MEDIA (media_comment, commenter, media) " +
                        "VALUES (:1, :2, :3)";
    var trip_script = "INSERT INTO COMMENT_TRIP (trip_comment, commenter, trip) " +
                        "VALUES (:1, :2, :3)";
    var script = is_media ? media_script : trip_script;

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [is_media ? comment.media_comment.toString() : comment.trip_comment.toString(),
                               comment.commenter,
                               is_media ? comment.media : comment.trip],
                                function(err, results) {
                                    if (err) { callback(null, "Error adding comment: " + err); }
                                    else { callback({comment: comment}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     

}

var dbAddRating = function(rating, is_media, callback){
    var media_script = "INSERT INTO RATE_MEDIA (rating, rater, media) " +
                        "VALUES (:1, :2, :3)";
    var trip_script = "INSERT INTO RATE_TRIP (rating, rater, trip) " +
                        "VALUES (:1, :2, :3)";
    var script = is_media ? media_script : trip_script;

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [rating.rating,
                               rating.rater,
                               is_media ? rating.media : rating.trip],
                                function(err, results) {
                                    if (err) { callback(null, "Error adding rating: " + err); }
                                    else { callback({rating: rating}, null); }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
        }
    });     
}

var dbRecommendFriend = function(user, callback){
    var script = "SELECT F2.FRIEND_2 " + 
                 "FROM USERS U " + 
                 "INNER JOIN FRIENDS F ON U.id = F.FRIEND_1 " + 
                 "INNER JOIN FRIENDS F2 ON F.FRIEND_2 = F2.FRIEND_1 " +
                 "WHERE U.id = :1 AND NOT (U.id = F2.FRIEND_2) AND F2.STATUS = 1;"
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script,
                               [user.id],
                                function(err, results) {
                                    if (err) { callback(null, "Error getting friend recs: " + err); }
                                    else { callback({friend_recs: results}, null); }
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

var dbSearch = function(searchTerm, callback){
    var user_script = "SELECT U.id, U.name " +
                        "FROM USERS U " +
                        "WHERE U.name LIKE '%:1%'";
    var location_script = "SELECT L.id, L.name " +
                          "FROM LOCATIONS L " +
                          "WHERE L.name LIKE '%:1%'";
    var user_res = nil;
    var location_res = nil;

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(user_script,
                               [searchTerm],
                                function(err, results) {
                                    if (err) { callback(null, "Error user search results: " + err); }
                                    else { user_res = results; }
                                    connection.close();
                                    console.log("Connection closed.")
                                });
            connection.execute(location_script,
                                [searchTerm],
                                function(err, results) {
                                    if(err) { callback(null, "Error location search results: " + err); }
                                    err { callback({user_results: user_res, location_results: results}, null); }
                                    connection.close();
                                    console.log("connection closed");
                                });
        }
    });    
}

var database = {
  getUser: dbGetUser,
  getUserExists: dbGetUserExists,
  postUser: dbPostUser,
  updateUser: dbUpdateUser,
  postTrip: dbPostTrip,
  addFriend: dbAddFriend,
  updateFriend: dbRespondToFriendRequest,
  getNewsFeed: dbGetNewsFeed,
  inviteTrip: dbInviteTrip,
  updateTripInvite: dbRespondToTripInvite,
  addMedia: dbAddMedia,
  addComment: dbAddComment,
  addRating: dbAddRating,
  recommendFriends: dbRecommendFriend,
  recommendLocation: dbRecommendLocation,
  search: dbSearch
};

module.exports = database;
                                        
