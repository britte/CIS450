var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };
var _ = require('underscore');

var dbGetValidLocation = function(location, callback) {
    var script = "SELECT * FROM locations WHERE name=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [location], function(err, results) {
                if (err) { callback( null, err); }
                else { callback(results[0] || false, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbPostLocation = function(location, callback) {
    generateId("SELECT MAX(id) AS ID FROM locations", function(data, err){
        if (err) { callback(null, err)}
        else {
            var script = "INSERT INTO locations (id, name) " +
                         "VALUES (:1, :2)";
            oracle.connect(connectData, function(err, connection){
                if (err) { console.log("Error connecting to db:" + err); }
                else {
                    console.log("Connected...");
                    var id = data.ID + 1;
                    connection.execute(script, [id, location], function(err, results) {
                        if (err) { callback( null, err); }
                        else { callback(id, null); }
                        connection.close();
                        console.log("Connection closed.")
                    });
                }
            });
        }
    });

}

var dbPostTrip = function(uid, name, lid, callback){
    generateId("SELECT MAX(id) AS ID FROM trips", function(data, err){
        if (err) {
            callback(null, err)
        } else {
            var create_script = "INSERT INTO trips (id, owner, start_date, end_date, name) " +
                                "VALUES (:1, :2, :3, :4, :5)";
            var join_script = "INSERT INTO participate_trip (status, inviter, invitee, trip) "+
                              "VALUES (:1, :2, :3, :4)"
            // Create trip
            oracle.connect(connectData, function(err, connection){
                if (err) { console.log("Error connecting to db:" + err); }
                else {
                    console.log("Connected...");
                    var id = data.ID + 1;
                    connection.execute(create_script, [id, uid, null, null, name], function(err, results) {
                        if (err) {
                            callback( null, err);
                            connection.close();
                            console.log("Connection closed.")
                        }
                    })
                }
            });

            // Creator joins implicitly with status 2
            oracle.connect(connectData, function(err, connection){
                if (err) { console.log("Error connecting to db:" + err); }
                else {
                    console.log("Connected...");
                    var id = data.ID + 1;
                    connection.execute(join_script, [2, uid, uid, id], function(err, results) {
                        if (err) { callback( null, err); }
                        else { callback(id, null); }
                        connection.close();
                        console.log("Connection closed.")
                    })
                }
            });
        }
    });
}

var dbPostTripTo = function(tid, lid, callback){
   var script = "INSERT INTO trip_to (trip, location) " +
                "VALUES (:1, :2)";
   oracle.connect(connectData, function(err, connection){
       if (err) { console.log("Error connecting to db:" + err); }
       else {
           console.log("Connected...");
           connection.execute(script, [tid, lid], function(err, results) {
               if (err) { callback( null, err); }
                else { callback(true, null); }
                       connection.close();
                       console.log("Connection closed.")
           })
       }
   });
}

var dbUpdateTrip = function(tid, name, callback){
    var script = "UPDATE trips " +
                 "SET name=:1 " +
                 "WHERE id=:2";
    oracle.connect(connectData, function(err, connection){
        if (err) {
            console.log("Error connecting to db: " + err);
        } else {
            console.log("Connected...");
                connection.execute(script, [name, tid],
                    function(err, results){
                        if (err) { callback(null, err); }
                        else { callback(true, null);}
                        connection.close();
                        console.log("connection closed.");
                });
        }
    });
}

var dbGetTrip = function(tid, callback) {
    var script = "SELECT t.id, t.owner, t.name, l.name AS L_NAME, l.id AS L_ID " +
                 "FROM trips t " +
                 "INNER JOIN trip_to tt ON tt.trip = t.id " +
                 "INNER JOIN locations l ON tt.location = l.id " +
                 "WHERE t.id=:1";
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

var dbGetValidTrip = function(tname, callback) {
    var script = "SELECT * FROM trips WHERE name=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [tname], function(err, results) {
                if (err) { callback( null, err); }
                else {
                    if(results) {callback(results[0], null); }
                    else {callback(null, null);}
                }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUserTrips = function(uid, callback) {
    var script = "SELECT t.id, t.name, t.owner, pt.status " +
                 "FROM participate_trip pt " +
                 "INNER JOIN users u ON pt.invitee = u.id " +
                 "INNER JOIN trips t ON pt.trip = t.id " +
                 "WHERE pt.status > 0 AND u.id=:1";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid], function(err, results) {
                console.log(results)
                if (err) { callback( null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetTripInvites = function(uid, confirmed, callback) {
    var script = "SELECT t.name, t.id, pt.participate_date " +
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
    var script = "SELECT DISTINCT u.name, u.login, u.id, pt.status, pt.participate_date " +
                 "FROM users u " +
                 "INNER JOIN participate_trip pt ON pt.invitee = u.id " +
                 "WHERE (pt.trip =:1)";
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
    var script = "INSERT INTO PARTICIPATE_TRIP (status, inviter, invitee, trip, CURRENT_TIMESTAMP) " +
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

var dbPostDream = function(uid, lid, rank, callback){
    var script = "INSERT INTO DREAMS(dream_date, dreamer, location, rank) " +
                 "VALUES (CURRENT_TIMESTAMP, :1, :2, :3)";

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid, lid, rank], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(true, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });    
}

var dbGetDreams = function(uid, callback){
    var script = "SELECT L.id, L.name" +
                 "FROM DREAMS D" +
                 "INNER JOIN Locations L ON L.id = D.Location" +
                 "WHERE D.Dreamer = :1;"

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(results, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });    
}

var database = {
    postLocation: dbPostLocation,
    getValidLocation: dbGetValidLocation,

    postTrip: dbPostTrip,
    postTripTo: dbPostTripTo,
    getTrip: dbGetTrip,
    getValidTrip: dbGetValidTrip,
    updateTrip: dbUpdateTrip,
    getUserTrips: dbGetUserTrips,
    getTripInvites: dbGetTripInvites,
    getInvitedFriends: dbGetInvitedFriends,
    postTripInvite: dbInviteTrip,
    confirmInviteRequest: dbConfirmInviteRequest,
    rejectInviteRequest: dbRejectInviteRequest,
};

module.exports = database;
