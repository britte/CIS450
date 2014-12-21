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
//              FRIENDSHIP LOGIC
// ************************************************ //

var dbAddFriend = function(uid, fid, callback){
//    var script = "INSERT ALL " +
//                 "INTO friends (friend_date, friend_1, friend_2, status) VALUES (:1, :2, :3, :4) " +
//                 "INTO friends (friend_date, friend_1, friend_2, status) VALUES (:1, :3, :2, :4) " +
//                 "SELECT * FROM dual";
    var script = "INSERT INTO friends " +
                 "(friend_date, friend_1, friend_2, status) " +
                 "VALUES (CURRENT_TIMESTAMP, :1, :2, :3)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            // TODO: create timestamp logic
            connection.execute(script, [uid, fid, 0], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results, null); }
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

var dbConfirmFriendRequest = function(uid, rid, callback){
    var add_script = "INSERT INTO friends " +
                     "(friend_date, friend_1, friend_2, status) " +
                     "VALUES (CURRENT_TIMESTAMP, :1, :2, :3)";
        update_script = "UPDATE FRIENDS " +
                        "SET STATUS = 1, FRIEND_DATE = CURRENT_TIMESTAMP " +
                        "WHERE (FRIEND_1 = :1 AND FRIEND_2 = :2)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(add_script, [uid, rid, 1], function(err, results) {
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

var dbRecommendFriend = function(uid, callback){
    var script = "SELECT R.NAME, R.LOGIN " +
                 "FROM USERS U " +
                 "INNER JOIN FRIENDS F ON U.id = F.FRIEND_1 " +
                 "INNER JOIN FRIENDS F2 ON F2.FRIEND_1 = F.FRIEND_2 " +
                 "INNER JOIN USERS R ON R.ID = F2.FRIEND_2 " +
                 "WHERE U.id =:1 AND NOT (U.id = F2.FRIEND_2) AND F.STATUS = 1";
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

var database = {
  postFriendRequest: dbAddFriend,
  getFriends: dbGetFriends,
  confirmFriendRequest: dbConfirmFriendRequest,
  getFriendRequests: dbGetFriendRequests,
  rejectFriendRequest: dbRejectFriendRequest
  getFriendRecs: dbRecommendFriend,
};

module.exports = database;