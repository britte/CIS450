var db = require('../models/tripDB.js');

var get_users = function(req, res) {
    res.render('index', {data: [{user: 'amy'},{user: 'john'}]})
//    db.users(function(data, err) {
//        if (err) {
//            console.log('fuck it')
//        } else if (data) {
//            console.log(data);
//            res.render('index', {data: JSON.stringify(data.users)});
//        } else {
//            res.redirect('/error/?error=logout');
//        }
//    });
}

var routes = {
    api: {
        users: get_users
    }
};

module.exports = routes;

// RENDER MAIN PAGES
// Render the login page
// Include proper error message if applicable
//var getMain = function(req, res) {
//	var err = req.param('error');
//	var message;
//	if (err == "usr") message = "Invalid username. New users sign up below!";
//	else if (err == "pwd") message = "Invalid password. Please try again.";
//	else if (err == "login") message = "Please log in to access site.";
//	else message = err;
//	res.render('main.ejs', {error: message});
//};

//var getHome = function(req, res) {
//	var user = req.session.user;
//	var err = req.param('error');
//	var message = req.param.message;
//	var status = req.param.status;
//	var friendships = req.param.friendships;
//	var updates = req.param.updates;
//
//	if (err == "status") message = "An error occured when posting your status.";
//	if (err == "comment") message = "An error occured when posting your comment.";
//	 if (user){/*
//		db.postFromNewsfeed(user, function(data, err) {
//			if (err) {
//				res.redirect('/error/?error='+err);
//		    } else if (data) {
//
//		    }
//		});*/
//		res.render('homepage.ejs', {results: status, user: user, error: message});
//	} else {
//		res.redirect('/?error=usr');
//	}
//};
//var getWall = function(req, res) {
//	var viewer = req.session.user;
//	var user = req.param('user');
//	var err = req.param('error');
//	var message;
//	if (err == "status") message = "An error occured when posting your status.";
//	if (err == "comment") message = "An error occured when posting your comment.";
//	if (user) {
//		db.profile(user, function(data, err) {
//			if (err) {
//				res.redirect('/error/?error='+err);
//		    } else if (data) {
//		    	res.render('wall.ejs', {profile: data,
//		    							owner: (viewer == user),
//		    							error: message});
//		    } else {
//		    	res.redirect('/error/?error=unknown');
//		    }
//		});
//	} else {
//		// don't load a wall if no user is logged in
//		res.redirect('/?error=usr');
//	}
//};
//var getError = function (req, res) {
//	var err = req.param('error');
//	var message;
//	if (err == "permission") message = "You do not have permission for this page.";
//	else message = err;
//	res.render('error.ejs', {error: message});
//}
//// Log user in
//var postLogin = function(req, res) {
//	var user = req.body.username;
//	var pwd  = req.body.password;
//	if (user != null && user != ''){
//		db.login(user, pwd, function(data, err) {
//			if (err) {
//				res.redirect('/?error='+err);
//		    } else if (data) {
//		    	req.session.user = user; // record user id in session
//		    	req.session.name = data; // record user's name in session
//		    	//res.redirect('/wall/'+user);
//		    	res.redirect('/newsfeed');
//		    } else {
//		    	res.redirect('/');
//		    }
//		});
//	} else {
//		res.redirect('/?error=usr');
//	}
//};
//
//// First tier of sign up
//// Check for unique username and valid password
//var getSignUp = function (req, res) {
//	var err = req.param('error');
//	var message;
//	if (err == "void") message = "Please fill in all fields.";
//	else if (err == "put") message = "Error storing in database.";
//	else if (err == "exists") message = "Username take. Please choose another.";
//	else message = err;
//	res.render('signup.ejs', {error:message});
//};
//
////Second tier of sign up
////Require user to fill in basic profile information
//var getInfoEdit = function (req, res) {
//	var viewer = req.session.user;
//	var user = req.param('user');
//	console.log("Loading profile edit page for "+user);
//	var err = req.param('error');
//	var message;
//	if (err == "void") message = "Please fill in all fields.";
//	else if (err == "put") message = "Error storing in database.";
//	else message = err;
//	if (user == viewer) {
//		db.profile(user, function(data, err) {
//			if (err) {
//				res.redirect('/error/?error='+err);
//		    } else if (data) {
//		    	res.render('info.ejs', {profile: data,
//		    							error: message});
//		    } else {
//		    	res.redirect('/error/?error=unknown');
//		    }
//		});
//	} else if (user) {
//		res.redirect('/error/?error=permission');
//	} else {
//		res.redirect('/error/?error=unknown');
//	}
//};
//
////Create and log in new user
//var postCreateAccount = function(req, res) {
//	var usr = req.body.usr;
//	var pwd = req.body.pwd;
//	var first  = req.body.first;
//	var last  = req.body.last;
//	var email = req.body.email;
//	var month = req.body.month;
//	var day = req.body.day;
//	var year = req.body.year;
//	var birthday = null;
//	if (month && day && year) {
//		birthday = month + "/" + day + "/" + year;
//	};
//	// Check that all input fields are filled in
//	if (usr && pwd && first && last && email && birthday) {
//		db.create(usr, pwd, first, last, birthday, email, function(data, err) {
//			if (err) {
//				res.redirect('/signup/?error='+err);
//			} else if (data) {
//				req.session.usr=usr;
//				res.redirect('/editinfo/'+usr);
//			} else {
//				res.redirect('/signup/?error='+err);
//			}
//		 });
//	} else {
//		res.redirect('/signup/?error=void'); // empty field
//	}
//};
//
////Create and log in new user
//var postUpdateNetwork = function(req, res) {
//	var user = req.session.user;
//	var network = req.body.network;
//	// Check that all input fields are filled in
//	if (user) {
//		db.network(user, network, function(data, err) {
//			if (err) {
//				res.redirect('/editinfo/'+user+'/?error='+err);
//			} else if (data) {
//				res.redirect('/editinfo/'+user);
//			} else {
//				res.redirect('/editinfo/'+user+'/?error=unknown');
//			}
//	 	});
//	} else {
//		res.redirect('/editinfo/'+user+'/?error=usr');
//	}
//};
//
//var postAddInterest = function(req, res) {
//	var user = req.session.user;
//	var interest = req.body.interest;
//	// Check that all input fields are filled in
//	if (user) {
//		db.interest(user, interest, function(data, err) {
//			if (err) {
//				res.redirect('/editinfo/'+user+'/?error='+err);
//			} else if (data) {
//				res.redirect('/editinfo/'+user);
//			} else {
//				res.redirect('/editinfo/'+user+'/?error=unknown');
//			}
//	 	});
//	} else {
//		res.redirect('/editinfo/'+user+'/?error=usr');
//	}
//};
//
//
//var getLogout = function(req, res) {
//    var user = req.session.user;
//    if (user != null && user != ''){
//        db.logout(user, function(data, err) {
//            if (err) {
//                res.redirect('/error/?error='+err);
//            } else if (data) {
//                req.session.user = null;
//                res.redirect('/');
//            } else {
//                res.redirect('/error/?error=logout');
//            }
//        });
//    } else {
//        res.redirect('/error/?error=logout');
//    }
//};
//
//var postStatus= function(req,res) {
//	var status = req.body.status;
//	var username = req.session.user;
//
//	console.log(status);
//	console.log(username);
//
//	db.addstatus(username, status, function(data,err) {
//		if (err) {
//			res.redirect('/homepage?error=status');
//		} else {
//			console.log('returned from add status');
//			res.redirect('/homepage');
//		}
//	});
//};
//
//var getUpdates = function (req,res) {
//	var user = "lizbiz";
//	db.getposts(user, function(data,err) {
//		if (err) {
//			res.redirect('/error/?error=getposts');
//		} else if (data){
//			res.json(data);
//		} else {
//			res.redirect('/error/?error=status');
//		}
//	});
//}
//
//var postWall= function(req,res) {
//	var poster = req.session.user;
//	var post = req.body.post;
//	var walluser = req.body.user;
//	var posterName = req.session.name;
//	console.log(post);
//	console.log(poster);
//	console.log(walluser);
//	console.log(posterName);
//	db.addpost(poster, posterName, post, walluser, function(data,err) {
//		if (err === "permisson") {
//			res.redirect('/wall/'+walluser);
//		} else if (data) {
//			res.redirect('/wall/'+walluser);
//		} else {
//			res.redirect('/error/?error=wallpost');
//			console.log("Error " + err);
//		}
//	});
//};
//
//var postFromNewsfeed= function(req,res) {
//	var poster = req.session.user;
//	var post = req.body.post;
//	var walluser = poster;
//	var posterName = req.session.name;
//	console.log(post);
//	console.log(poster);
//	console.log(walluser);
//	console.log(posterName);
//	db.addpost(poster, posterName, post, walluser, function(data,err) {
//		if (err === "permisson") {
//			res.redirect('/wall/'+walluser);
//		} else if (data) {
//			res.redirect('/wall/'+walluser);
//		} else {
//			res.redirect('/error/?error=wallpost');
//			console.log("Error " + err);
//		}
//	});
//};
//
//var getWallPosts = function (req,res) {
//	var user = req.param('user');
//	db.getposts(user, function(data,err) {
//		if (err) {
//			res.redirect('/error/?error=getposts');
//		} else if (data){
//			res.json(data);
//		} else {
//			res.redirect('/error/?error=getposts');
//		}
//	});
//}
//
//var getNewsfeed = function (req,res) {
//	var user = req.session.user;
//	console.log("trying to get newsfeed");
//	db.getNewsfeed(user, function(err,data) {
//		if (err) {
//			console.log(err);
//			res.redirect('/error/?error=getposts');
//		} else {
//			console.log("sending data to newsfeed page");
//			console.log(data)
//			res.json(data);
//		}
//	});
//}
//
//var getInterests = function (req,res) {
//	var user = req.param('user');
//	db.getinterests(user, function(data,err) {
//		if (err) {
//			res.redirect('/error/?error=getinterests');
//		} else if (data){
//			res.json(data);
//		} else {
//			res.redirect('/error/?error=getinterests');
//		}
//	});
//}
//
//// Post Comments to a status
//var postComment= function(req,res) {
//	var database = req.param('type');
//	var id = req.param('id');
//	var current = req.param('current');
//	var name = req.session.name;
//	var comment = req.body.comment;
//	if (database == "wall") database = "FB_walls";
//	else if (database == "status") database = "FB_statuses";
//	else database = null;
//	if (database && id && name && comment && current){
//		var userComment = ('<a href="../wall/'+req.session.user+'">'+name+'</a>: '+comment);
//		db.addcomment(database, id, name, userComment, function(data,err) {
//			res.redirect('/wall/'+current);
//		});
//	}
//};
//
//var getSearch = function (req, res){
//	console.log('Searching for items like: '+req.params.input);
//	db.search(req.params.input, function(data,err) {
//		if (data) {
//			res.send(JSON.stringify(data));
//		}
//	});
//}
//
//var getOnline = function (req,res) {
//	var user = req.param('user');
//	db.online(user, function(data,err) {
//		if (err) {
//			res.redirect('/error/?error=getonline');
//		} else if (data){
//			res.json(data);
//		} else {
//			res.json({});
//		}
//	});
//}
//
//var addfriend = function(req,res) {
//	var viewer = req.session.user;
//	var user = req.param('user');
//	console.log(viewer);
//	console.log(user);
//	db.addfriend(viewer, user, function(data,err){
//		if (err) {
//			res.redirect('error/?error='+err);
//		}
//		else res.redirect('/wall/'+user);
//
//	})
//
//}
//
//var routes = {
//// Page Rendering
//  get_main: getMain,
//  get_homepage: getHome,
//  get_wall: getWall,
//  get_error: getError,
//// Login & Signup
//  post_login: postLogin,
//  get_signup: getSignUp,
//  post_createaccount: postCreateAccount,
//  get_editinfo: getInfoEdit,
//  post_network: postUpdateNetwork,
//  post_addinterest: postAddInterest,
//  get_online: getOnline,
//  get_logout: getLogout,
//// Status Items
//  get_updates: getUpdates,
//  post_status: postStatus,
//  post_comment: postComment,
//  post_fromNewsfeed: postFromNewsfeed,
//// Wall Items
//  post_wall: postWall,
//  get_wallposts: getWallPosts,
//  get_interests: getInterests,
//  get_newsfeed: getNewsfeed,
//// Search
//  get_search: getSearch,
//  //add freind
//  add_friend: addfriend
//};
//
//module.exports = routes;
