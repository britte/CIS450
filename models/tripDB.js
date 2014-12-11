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

var database = {
  getUser: dbGetUser,
  getUserExists: dbGetUserExists,
  postUser: dbPostUser
};

module.exports = database;
                                        
