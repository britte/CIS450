var db = require('../models/DB.js');
var mango = require('../models/mongoDB.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/';

var _ = require('underscore');

var get_session = function(req, res) {
     res.json(req.session)
 }

var get_login = function(req, res) {
    var login = req.params.login,
        pwd = req.params.pwd;
    db.getUser(login, pwd, function(user, err) {
        if (user) {
            req.session.user = user;
            res.json(user)
        } else {
            res.status(500).send({ msg: 'Invalid login' });
        }
    })
}

var get_logout = function(req, res) {
    req.session.user = null;
    res.redirect('/login');
}

var get_user = function(req, res) {
    var login = req.params.login;
    db.getUser(login, null, function(user, err) {
        if (err) {
            res.status(500).send({ msg: err });
        } else {
            res.json(user)
        }
    });
}

// Create a new user account
var post_user = function(req, res) {
    var user = req.body;
    if (!user.name || !user.login || !user.pwd) {
        res.status(500).send({ msg: 'Invalid data' });
    }
    // Check that username doesn't exist
    db.getUserExists(user.login, function(data, err) {
        if (!data) {
            // Create user
            db.postUser(user, function(data, err){
                if (data) {
                    req.session.user = user;
                    res.status(200).send({ msg: 'success'})
                } else {
                    res.status(500).send({ msg: err });
                }
            })
        } else {
            res.status(500).send({ msg: 'User login is taken.' });
        }
    });
}

// Edit a user's information
var put_user_update = function(req, res) {
    var name = req.body.name,
        aff = req.body.affiliation,
        pwd = req.body.pwd,
        login = req.session.user ? req.session.user.LOGIN : res.redirect('/');

    db.updateUser(login, name, pwd, aff, function(data, err){
        if (err){;
            res.status(500).send({msg: 'Invalid data'})
        } else {
            // Update session cookie
            req.session.user.AFFILIATION = aff;
            req.session.user.PWD = pwd;
            req.session.user.NAME = name;
            res.status(200).send('success')
        }
    });
}

var get_news_feed = function(req, res){
    var login = req.params.login;
    db.getNewsFeed(login, function(feed, err){
        if(err){
            res.status(500).send({ msg: err });
        } else {
            res.json(feed)
        }
    });
}

var update_cache = function(req, res){
    db.updateCache(function(data, err){
        if(err){
            console.log("error updating cache");
        } else {
            var cacheMap = {};
            cacheMap["first"] = [data[0].id, data[0].media_url];
            cacheMap["second"] = [data[1].id, data[1].media_url];
            cacheMap["third"] = [data[2].id, data[2].media_url];
            if(req.body.first_time){
                MongoClient.connect(url, {native_parser:true}, function(err, mangodb) {
                    if(err){
                        console.log("error with mongo client for inserting");
                    } else {
                        mango.insertTrio(mangodb, cacheMap, function(results){
                            if(!results){
                                console.log("error inserting trio");
                            } else {
                                console.log("trio inserted successfully");
                            }
                        });
                    }
                });
            } else {
                MongoClient.connect(url, {native_parser:true}, function(err, mangodb){
                    if(err){
                        console.log("error with mongo client for updating");
                    } else {
                        var docs = nil;
                        mango.getAll(db, function(results){
                            docs = results;
                        });
                        mango.update(mangodb, docs[0], data[0], function(results){
                            if(!results){
                                console.log("error updating");
                            } else {
                                console.log("updated correctly");
                            }
                        });
                    }
                });
            }
        }
    });
}

var get_pending = function(req, res){
    var user = req.session.user || res.redirect('/'),
        uid = user.ID;
    db.getAllPending(uid, false, function(data, err){
        if(err) {
            console.log("Error getting pending: " + err);
            res.json({data: data, err: !!err, errMsg: err});
        } else {
            res.json({friends : _.filter(data, function(f){ return f.TYP == 'friend' }),
                      trips : _.filter(data, function(f){ return f.TYP == 'trip' })
                      })

        }
    });
}

var search = function(req, res){
    var query = req.body.query;
    db.search(query, function(data, err){
       if(err) {
           console.log("error during user/location search" + err);
       } else {
            console.log(data)
            res.json(data);
       }
    });
}

var get_location_search = function(req, res){
    var query = req.body.query;
    db.locationSearch(query, function(data, err){
       if(err) {
           console.log("error during user/location search" + err);
       } else {
            res.json(data);
       }
    });
}

var get_trip_search = function(req, res){
    var query = req.body.query;
    db.locationSearch(query, function(data, err){
       if(err) {
           console.log("error during user/location search" + err);
       } else {
            res.json(data);
       }
    });
}

var api = {
    get_session: get_session,
    get_login: get_login,
    get_logout: get_logout,
    get_user: get_user,
    post_user: post_user,
    put_user_update: put_user_update,

    get_news_feed: get_news_feed,
    get_pending: get_pending,
    get_search: search,
    get_location_search: get_location_search
};

module.exports = api;
