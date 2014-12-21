var _ = require('underscore');

var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };

var generateId = function(script, callback){
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(results[0], null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUserPrivacy = function(uid, fid, callback){
    var script = "SELECT * FROM friends " +
                 "WHERE (friend_1=:1 AND friend_2=:2 AND status=1)";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err); }
        else {
            console.log("Connected...");
            connection.execute(script, [uid, fid], function(err, results) {
                if (err) { callback(null, err); }
                else { callback(results.length == 0, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

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

var dbUpdateUser = function(login, name, pwd, aff, callback){
    var script = "UPDATE users " +
                 "SET name=:1, affiliation=:2, pwd=:3 " +
                 "WHERE login=:4";
    oracle.connect(connectData, function(err, connection){
        if (err) {
            console.log("Error connecting to db: " + err);
        } else {
            console.log("Connected...");
                connection.execute(script, [name, aff, pwd, login],
                    function(err2, results){
                        if(err2) { callback(null, err2); }
                        else { callback(true, null);}
                        connection.close();
                        console.log("connection closed.");
                });
        }
    });
}

var dbGetNewsFeed = function(login, callback){
    var friend_script = "SELECT uf1.name as f_name, uf1.id as f_id, uf1.login as f_login, " +
                               "uf2.id as id, uf2.name as name, f2.friend_date as ts, uf2.login as misc, 'friend' as typ " +
                        "FROM Users U " +
                        "INNER JOIN Friends F ON (U.ID = F.Friend_1 AND status = 1) " +
                        "INNER JOIN Friends f2 ON (f2.friend_1 = f.friend_2 OR f2.friend_2 = f.friend_2) " +
                                               "AND (f2.friend_1 != u.id AND f2.friend_2 != u.id) " +
                                               "AND f2.status = 1 " +
                        "INNER JOIN users uf1 ON uf1.id = f2.friend_1 " +
                        "INNER JOIN users uf2 ON uf2.id = f2.friend_2 " +
                        "WHERE U.login = :1 "
    var media_script = "SELECT fu.name as f_name, fu.id as f_id, fu.login as f_login, " +
                               "a.id as id, a.name as name, a.creation_date as ts, null as misc, 'album' as typ " +
                        "FROM Users U " +
                        "INNER JOIN Friends F ON (U.ID = F.Friend_1 AND status = 1) " +
                        "INNER JOIN Users fu ON f.friend_2 = fu.id " +
                        "INNER JOIN Albums a on a.owner = f.friend_2 " +
                        "WHERE U.login = :1 ";
    var trips_script = "SELECT fu.name as f_name, fu.id as f_id, fu.login as f_login, " +
                              "t.id as id, t.name as name, t.creation_date as ts, l.name as misc, 'trip' as typ " +
                       "FROM Users U " +
                       "INNER JOIN Friends F ON (U.ID = F.Friend_1 AND status = 1) " +
                       "INNER JOIN Users fu ON f.friend_2 = fu.id " +
                       "INNER JOIN Trips t on t.owner = f.friend_2 " +
                       "INNER JOIN trip_to tt on t.id = tt.trip " +
                       "INNER JOIN locations l on tt.location = l.id " +
                       "WHERE U.login = :1 ";
    var script = "WITH friend_news AS ("+friend_script+"), " +
                 "media_news AS ("+media_script+"), " +
                 "trips_news AS ("+trips_script+") " +
                 "SELECT * FROM friend_news " +
                 "UNION " +
                 "SELECT * FROM media_news " +
                 "UNION " +
                 "SELECT * FROM trips_news "

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db: " + err);}
        else {
            console.log("Connected...");
            connection.execute(script, [login], function(err, results) {
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

var dbSearch = function(searchTerm, callback){
    var user_script = "SELECT U.id, U.name, 'user' as typ " +
                     "FROM USERS U " +
                     "WHERE lower(U.name) LIKE :1 ";
    var location_script = "SELECT L.id, L.name, 'loc' as typ " +
                         "FROM LOCATIONS L " +
                         "WHERE lower(L.name) LIKE :1" ;

    var trip_script = "SELECT T.id, T.name, 'trip' as typ " +
                      "FROM TRIPS T " +
                      "WHERE lower(T.name) LIKE :1 ";

    var media_script = "SELECT A.id, A.name, 'album' as typ " +
                       "FROM ALBUMS A " +
                       "WHERE lower(A.name) LIKE :1";

    var script = "WITH usersres AS (" + user_script + "), " +
                "locres AS (" + location_script + "), " +
                "tripres AS (" + trip_script + "), " +
                "albumres AS (" + media_script + ") " +
                "SELECT * FROM usersres " +
                "UNION " +
                "SELECT * FROM locres " +
                "UNION " + 
                "SELECT * FROM tripres " +
                "UNION " +
                "SELECT * FROM albumres ";

    oracle.connect(connectData, function(err, connection){
       if (err) { console.log("Error connecting to db:" + err); }
       else {
           console.log("Connected...");
           var term = '%'+searchTerm.toString().toLowerCase()+'%';
           console.log(script)
           connection.execute(script, [term], function(err, results) {
               if (err) { callback(null, "Error user search results: " + err); }
               else { callback(results, null); }
               connection.close();
               console.log("Connection closed.")
           });
       }
    });
}

var dbLocationSearch = function(searchTerm, callback){
   var script = "SELECT L.id, L.name " +
                 "FROM LOCATIONS L " +
                 "WHERE lower(L.name) LIKE :1 ";
   oracle.connect(connectData, function(err, connection){
       if (err) { console.log("Error connecting to db:" + err); }
       else {
           console.log("Connected...");
           var term = '%'+searchTerm.toString().toLowerCase()+'%';
           console.log(term)
           connection.execute(script, [term], function(err, results) {
               if (err) { callback(null, "Error user search results: " + err); }
               else { callback(results, null); }
               connection.close();
               console.log("Connection closed.")
           });
       }
   });
}

var dbTripSearch = function(searchTerm, callback){
   var script = "SELECT T.id, T.name " +
                 "FROM Trip T " +
                 "WHERE lower(T.name) LIKE :1 ";
   oracle.connect(connectData, function(err, connection){
       if (err) { console.log("Error connecting to db:" + err); }
       else {
           console.log("Connected...");
           var term = '%'+searchTerm.toString().toLowerCase()+'%';
           console.log(term)
           connection.execute(script, [term], function(err, results) {
               if (err) { callback(null, "Error user search results: " + err); }
               else { callback(results, null); }
               connection.close();
               console.log("Connection closed.")
           });
       }
   });
}

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

// ************************************************ //
//                MIXED PAGE LOGIC
// ************************************************ //

var dbGetAllPending = function(uid, confirmed, callback) {

    var invites_script = "SELECT t.name, t.id, null as login, pt.participate_date as ts, 'trip' as typ " +
                         "FROM participate_trip pt " +
                         "INNER JOIN trips t ON pt.trip = t.id " +
                         "INNER JOIN users u ON pt.invitee = u.id " +
                         "WHERE (pt.status =:1 AND u.id =:2)";

    var requests_script = "SELECT f.name, f.id, f.login, uf.friend_date as ts, 'friend' as typ " +
                          "FROM users u " +
                          "INNER JOIN friends uf ON uf.friend_2 = u.id " +
                          "INNER JOIN users f ON f.id = uf.friend_1 " +
                          "WHERE (uf.status =:1 AND u.id =:2)";

    var script = "WITH invites AS ("+invites_script+"), " +
                 "requests AS ("+requests_script+") " +
                 "SELECT * FROM invites " +
                 "UNION " +
                 "SELECT * FROM requests";

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

var database = {
  getUser: dbGetUser,
  getUserExists: dbGetUserExists,
  postUser: dbPostUser,
  updateUser: dbUpdateUser,

  getUserPrivacy: dbGetUserPrivacy,

  updateCache: dbUpdateCachedMedia,

  getNewsFeed: dbGetNewsFeed,
  getAllPending: dbGetAllPending,
  search: dbSearch,

  locationSearch: dbLocationSearch,
  tripSearch: dbTripSearch
};

module.exports = database;
                                        
