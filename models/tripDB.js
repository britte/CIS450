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


// TODO: improve validation
var dbUpdateUser = function(uid, name, pwd, aff, callback){
    var script = "UPDATE users " +
                 "SET name=:1, affiliation=:2, pwd=:3 " +
                 "WHERE id=:4";
    oracle.connect(connectData, function(err, connection){
        if (err) {
            console.log("Error connecting to db: " + err);
        } else {
            console.log("Connected...");
                connection.execute(script, [name, aff, pwd, uid],
                    function(err2, results){
                        if(err2) { callback(null, err2); }
                        else { callback(true, null);}
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
            console.log('generator')
            callback(null, err)
        } else {
            var script = "INSERT INTO trips (id, owner, start_date, end_date, name) " +
                         "VALUES (:1, :2, :3, :4, :5) ";
            oracle.connect(connectData, function(err, connection){
                if (err) { console.log("Error connecting to db:" + err); }
                else {
                    console.log("Connected...");
                    var id = data.ID + 1;
                    connection.execute(script, [id, uid, null, null, name], function(err, results) {
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
                else { callback(results[0], null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbGetUserTrips = function(uid, callback) {
    var script = "SELECT t.id, t.name, t.owner " +
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
     var script =  "SELECT cm.media_comment, u.login AS U_LOGIN, u.name AS U_NAME " +
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

var dbGetNewsFeed = function(uid, callback){
    var friend_script = "SELECT uf1.name as f1_name, uf1.id as f1_id, uf1.login as f1_login, " +
                               "uf2.id as id, uf2.name as name, f2.friend_date as ts, uf2.login as misc, 'friend' as typ " +
                        "FROM Users U " +
                        "INNER JOIN Friends F ON (U.ID = F.Friend_1 AND status = 1) " +
                        "INNER JOIN Friends f2 ON (f2.friend_1 = f.friend_2 OR f2.friend_2 = f.friend_2) " +
                                               "AND (f2.friend_1 != u.id AND f2.friend_2 != u.id) " +
                                               "AND f2.status = 1 " +
                        "INNER JOIN users uf1 ON uf1.id = f2.friend_1 " +
                        "INNER JOIN users uf2 ON uf2.id = f2.friend_2 " +
                        "WHERE U.ID = :1"
    var media_script = "SELECT fu.name as f_name, fu.id as f_id, fu.login as f_login, " +
                               "a.id as id, a.name as name, a.creation_date as ts, null as misc, 'album' as typ " +
                        "FROM Users U " +
                        "INNER JOIN Friends F ON (U.ID = F.Friend_1 AND status = 1) " +
                        "INNER JOIN Users fu ON f.friend_2 = fu.id " +
                        "INNER JOIN Albums a on a.owner = f.friend_2 " +
                        "WHERE U.ID = :1";
    var trips_script = "SELECT fu.name as f_name, fu.id as f_id, fu.login as f_login, " +
                              "t.id as id, t.name as name, t.creation_date as ts, l.name as misc, 'trip' as typ " +
                       "FROM Users U " +
                       "INNER JOIN Friends F ON (U.ID = F.Friend_1 AND status = 1) " +
                       "INNER JOIN Users fu ON f.friend_2 = fu.id " +
                       "INNER JOIN Trips t on t.owner = f.friend_2 " +
                       "INNER JOIN trip_to tt on t.id = tt.trip " +
                       "INNER JOIN locations l on tt.location = l.id " +
                       "WHERE U.ID = :1";
    var script = "WITH friend_news AS ("+friend_script+"), " +
                 "media_news AS ("+media_script+"), " +
                 "trips_news AS ("+trips_script+") " +
                 "SELECT * FROM friend_news " +
                 "UNION " +
                 "SELECT * FROM media_news " +
                 "UNION " +
                 "SELECT * FROM trips_news "

    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:" + err);}
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

var dbSearch = function(searchTerm, callback){
   var user_script = "SELECT U.id, U.name, 'user' as typ " +
                       "FROM USERS U " +
                       "WHERE lower(U.name) LIKE '%:1%'";
   var location_script = "SELECT L.id, L.name, 'loc' as typ" +
                         "FROM LOCATIONS L " +
                         "WHERE lower(L.name) LIKE '%:1%'";

   var script = "WITH usersres AS (" + user_script + ")," +
                    "locres AS (" + location_script + ")" +
                    "SELECT * "+
                    "FROM usersres " +
                    "UNION " +
                    "SELECT * " +
                    "FROM locres";


   oracle.connect(connectData, function(err, connection){
       if (err) { console.log("Error connecting to db:" + err); }
       else {
           console.log("Connected...");
           connection.execute(script,
                              [searchTerm.toLowerCase()],
                               function(err, results) {
                                   if (err) { callback(null, "Error user search results: " + err); }
                                   else { callback({results: results}, null); }
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

  getUserPrivacy: dbGetUserPrivacy,

  updateCache: dbUpdateCachedMedia,

  getNewsFeed: dbGetNewsFeed,
};

module.exports = database;
                                        
