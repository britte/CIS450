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
                                    if (err) { callback(null, "Error updating friend request: " + err); }
                                    else { callback({user1: user1}, null); }
                                        connection.close();
                                        console.log("Connection closed.")
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
  getNewsFeed: dbGetNewsFeed
};

module.exports = database;
                                        
