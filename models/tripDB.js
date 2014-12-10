var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };

var dbGetUser = function(login, callback){
    var script = "select * from users u where u.login = '" + login + "'";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:", err); }
        else {
            console.log("Connected...");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, "Error fetching users:", err); }
                else { callback({users: results}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var dbPostUser = function(user, callback){
    var script = "INSERT INTO users (id, name, pwd, login) VALUES (:1, :2, :3, :4) RETURNING id INTO :5";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:", err); }
        else {
            console.log("Connected...");
            connection.execute(script, [151, 'LizBiz', 'password', 'lizbiz', new oracle.OutParam(oracle.OCCINUMBER)], function(err, results) {
                if (err) { callback(null, "Error creating user:", err); }
                else { callback({uid: results.returnParam}, null); }
                connection.close();
                console.log("Connection closed.")
            });
        }
    });
}

var database = {
  getUser: dbGetUser,
  postUser: dbPostUser
};

module.exports = database;
                                        
