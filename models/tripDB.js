var oracle = require('oracle'),
    connectData = {
        hostname: "tripplanner.cupmaezuqkvb.us-west-2.rds.amazonaws.com",
        port: 1521,
        database: "tripDB", // System ID (SID)
        user: "britneyspears",
        password: "450password"
    };

var getUsers = function(callback){
    var script = "select * from users";
    oracle.connect(connectData, function(err, connection){
        if (err) { console.log("Error connecting to db:", err); }
        else {
            console.log("Connected");
            connection.execute(script, [], function(err, results) {
                if (err) { callback(null, "Error fetching users:", err); }
                else { callback({users: results}, null); }
                connection.close();
            });
        }
    });
}

var database = {
  users: getUsers
};

module.exports = database;

/* The function below is an example of a database method. Whenever you need to 
   access your database, you should define a function (tripDB_addUser, tripDB_getPassword, ...)
   and call that function from your routes - don't just call SimpleDB directly!
   This makes it much easier to make changes to your database schema. */
//var tripDB_logout = function(user, callback){
//    console.log('Logging out user ' + user);
//    simpledb.deleteAttributes({DomainName:'FB_online', ItemName: user},
//        function (err, data) {
//        if (err) {
//            callback(null, "Logout error: "+ err);
//        } else {
//            callback(true, null);
//        }
//    });
//};
//
//var tripDB_getProfile = function(user, callback){
//	console.log('Loading profile for user ' + user);
//	simpledb.getAttributes({DomainName:'FB_users', ItemName: user},
//		function (err, data) {
//	    if (err) {
//	    	callback(null, "Lookup error: "+ err);
//	    } else if (data.Attributes === undefined) {
//	    	// user was not found
//	    	callback(null, "usr");
//	    } else if (data.Attributes != undefined) {
//	    	var valid = false;
//	    	var profile = {user: user, interests: []};
//	    	// user was found, gather profile information
//	    	for (i = 0; i<data.Attributes.length; i++){
//	    		if (data.Attributes[i].Name === "firstname"){
//	    			profile.firstname = data.Attributes[i].Value;
//	    		} else if (data.Attributes[i].Name === "lastname"){
//	    			profile.lastname = data.Attributes[i].Value;
//	    		} else if (data.Attributes[i].Name === "birthday"){
//	    			profile.birthday = data.Attributes[i].Value;
//	    		} else if (data.Attributes[i].Name === "email"){
//	    			profile.email = data.Attributes[i].Value;
//	    		} else if (data.Attributes[i].Name === "location"){
//	    			profile.location = data.Attributes[i].Value;
//	    		} else if (data.Attributes[i].Name === "network"){
//	    			profile.network = data.Attributes[i].Value;
//	    		}
//	    	}
//	    	callback(profile, null);
//	    } else {
//	    	callback (null, err);
//	    }
//	});
//}
//
//
//var tripDB_addAccount = function(usr, pwd, first, last, birthday, email, callback){
//	console.log('Create account for user ' + usr);
//	// attempt to create user account
//	simpledb.getAttributes(
//		{DomainName:'FB_users', ItemName: usr},
//		function (err, data) {
//			if (err) {
//				callback (null, err);
//		    } else if (data.Attributes == undefined) { // Username does not exist
//		    	simpledb.putAttributes({DomainName:'FB_users', ItemName: usr,
//		    	Attributes: [{Name: 'password', Value: pwd},
//		    	             {Name: 'firstname', Value: first},
//		    	             {Name: 'lastname', Value: last},
//		    	             {Name: 'birthday', Value: birthday},
//		    	             {Name: 'email', Value: email}]},
//		    	function (err, data) {
//		    	    if (err) callback (null, "put");
//		    	    else callback (true, null);
//		    	 });
//		    } else { // Username already in system
//		      callback (null, "exists");
//		    }
//	});
//};
//
//var tripDB_updateProfileFields = function(user, attr, callback){
//	// update network database
//	console.log("Updating profile fields for user "+ user);
//	simpledb.getAttributes(
//		{DomainName:'FB_users', ItemName: user},
//		function (err, data) {
//			if (err) {
//				callback (null, err);
//			} else if (data.Attributes != undefined) {
//				simpledb.putAttributes(
//					{DomainName: 'FB_users',
//					 ItemName: user,
//					 Attributes: attr},
//				function (err, data) {
//		    	     if (err) callback (null, "put");
//		    	     else callback (true, null);
//				});
//			} else {
//				callback (null, "put")
//			}
//	  });
//};
//
//var tripDB_updateNetwork = function(user, network, callback){
//	// return error if either user or network is null
//	if (!user) callback (null, "user");
//	if (!network) callback (null, "network");
//
//	// prepare attribute for user profile update
//	var attribute = [{Name: "network", Value: network, Replace: true}];
//
//	// update edge database
//	simpledb.putAttributes(
//		{DomainName: "FB_networks",
//		 ItemName: user,
//		 Attributes: attribute},
//	function (err, data) {
//		// if edges database updates successfully, update user profile
//		 if (data) {
//			 tripDB_updateProfileFields(user, attribute, callback);
//		 }
//		 else callback (null, "error");
//
//	});
//}
//
//var tripDB_addInterest = function(user, interest, callback){
//
//	if (!user) callback (null, "user");
//	if (!interest) callback (null, "interest");
//	console.log("Adding "+interest+" to "+user+"'s interests")
//	time = new Date().getTime().toString();
//	// add connection from user to interest db
//	simpledb.putAttributes(
//		{DomainName: "FB_user_interest",
//		 ItemName: user+'.'+interest,
//		 Attributes: [{Name: 'user', Value: user},
//		              {Name: 'interest', Value: interest},
//		              {Name: 'timestamp', Value: time, Replace: true}]},
//	function (err, data) {
//		 if (err) callback (null, "put");
//		 // make sure interest is in interest db
//		 else tripDB_createInterest(interest, callback);
//	});
//};
//
//var tripDB_createInterest = function(interest, callback){
//	// update network database
//	console.log("Checking existence of interest " + interest);
//	simpledb.getAttributes(
//		{DomainName:"FB_interests", ItemName: interest},
//		function (err, data) {
//			if (err) {
//				callback (null, err);
//			}
//			// New Interest
//			else if (data.Attributes === undefined) {
//				// create item
//				var time = new Date().getTime().toString();
//				simpledb.putAttributes(
//					{DomainName: "FB_interests",
//					 ItemName: interest,
//					 Attributes: [{Name: 'timestamp', Value: time}]},
//				function (err, data) {
//		    	     if (err) callback (null, "put");
//		    	     else {
//		    	    	 callback (true, null);
//		    	     }
//				});
//			}
//			// Existing interest
//			else {
//				callback (true, null);
//	    	};
//	  });
//};
//
//var tripDB_updateTally = function(domain, item, addsub, callback){
//	// update network database
//	simpledb.getAttributes(
//		{DomainName:domain, ItemName: item, AttributeNames: ['total']},
//		function (err, data) {
//			if (err) {
//				callback (null, err);
//			} else if (data.Attributes != undefined) {
//				// update item total
//				var total = parseInt(data.Attributes[0].Value);
//				if (addsub) total ++;
//				else total --;
//				simpledb.putAttributes(
//					{DomainName: domain,
//					 ItemName: item,
//					 Attributes: [{Name: 'total', Value: String(total), Replace: true}]},
//				function (err, data) {
//		    	     if (err) callback (null, domain+"_update");
//		    	     else return;
//				});
//			} else if (data.Attributes == undefined){
//				// create new item
//				simpledb.putAttributes(
//					{DomainName: domain,
//					 ItemName: item,
//					 Attributes: [{Name: 'total', Value: '1', Replace: true}]},
//				// if an error occurs use the callback to throw an error
//	    	    function (err, data) {
//	    	    	 if (err) callback (null, domain+"_put");
//	    	    	 else return;
//	    	    });
//	    	};
//	  });
//};
//
//var tripDB_updateLink = function(domain, node1, node2, callback){
//	// update network database
//	simpledb.putAttributes(
//		{DomainName: domain,
//		 ItemName: node1+'.'+node2,
//		 Attributes: [{Name: 'node1', Value: node1},
//		              {Name: 'node2', Value: node2}]},
//	function (err, data) {
//		 if (err) callback (null, domain+"_update");
//		 else return;
//	});
//};
//
//// Status Handling
//var tripDB_getStatuses = function(user, callback){
//  console.log('Searching for statuses');
//	simpledb.select(
//			{SelectExpression: "select * from FB_statuses where Time > '0' order by Time desc limit 5",
//			ConsistentRead: true},
//	function (err, data) {
//      if (err) {
//	    callback(null, "Lookup error: "+ err);
//	  } else {
//		 var results = [];
//		 for (i = 0; i<data.Items.length; i++){
//			var item = {id: data.Items[i].Name, comments: [], updateType: "status"};
//			// check all attributes in item
//		    for (j = 0; j<data.Items[i].Attributes.length; j++){
//		    	var name = data.Items[i].Attributes[j].Name;
//		    	var value = data.Items[i].Attributes[j].Value;
//		    	if (name === 'Text'){
//		    		item.status = value;
//		    	} else if (name === 'Creator'){
//		    		item.name = value;
//		    	} else if (name === 'Comment'){
//		    		item.comments.push(value);
//		    	}
//		    }
//		    // if item had all correct attributes, add it to results
//		    results.push(item);
//		 }
//		callback(results,null);
//	  }
//   });
//};
//
//var tripDB_addStatus = function(username, status, route_callbck) {
//	var time = new Date().getTime().toString();
//	var id = (username + time);
//	console.log(id);
//	simpledb.putAttributes({
//		DomainName : 'FB_walls',
//		ItemName: id,
//		Attributes : [ {
//			Name : 'Text',
//			Value : status
//		} , {
//			Name : 'Username',
//			Value : username
//		} , {
//			Name : 'Time',
//			Value : time
//		},
//		{
//			Name : 'Poster',
//			Value : username
//		},
//		{
//			Name : 'Text',
//			Value : status
//		},
//		]
//	}, function (err, data) {
//		if (err) {
//			console.log("error :" + err.toString());
//			route_callbck("error: " + err,null);
//		} else {
//			route_callbck(true, null);
//		}
//	});
//};
//
//// Wall Handling
//// Get wallposts by user
//var tripDB_getWallPosts = function(user, callback) {
//	if (!user) callback (null, "user");
//	console.log('Loading wall posts for user '+ user);
//	simpledb.select({
//		SelectExpression: 'select * from FB_walls ' +
//						  'where Username = "'+user+'" ' +
//						  'and Time > "0" ' +
//						  'order by Time ' +
//						  'limit 10',
//		ConsistentRead: true},
//		function (err, data) {
//			if (err) {
//				callback(null, "Lookup error: "+ err);
//			} else if (data.Items === undefined) {
//				callback([], null);
//			} else if (data.Items != undefined){
//				var results = [];
//				for (i = 0; i<data.Items.length; i++){
//					var item = {id: data.Items[i].Name, comments: []};
//					var valid = 0;
//					// check all attributes in item
//				    for (j = 0; j<data.Items[i].Attributes.length; j++){
//				    	var name = data.Items[i].Attributes[j].Name;
//				    	var value = data.Items[i].Attributes[j].Value;
//				    	if (name === 'Text'){
//				    		item.post = value;
//				    		valid++;
//				    	} else if (name === 'Poster'){
//				    		item.poster = value;
//				    		valid++;
//				    	} else if (name == 'comment'){
//				    		item.comments.push(value);
//				    	}
//				    }
//				    // if item had all correct attributes, add it to results
//				    if (valid == 2) {
//				    	results.push(item);
//				    }
//				}
//				callback(results, null);
//			} else {
//				callback(null, "err");
//			}
//	   });
//};
//
//var tripDB_getInterests = function(user, callback) {
//	if (!user) callback (null, "user");
//	console.log('Loading interests for user '+ user);
//	simpledb.select({
//		SelectExpression: 'select * from FB_user_interest where user = "'+user+'"',
//		ConsistentRead: true},
//		function (err, data) {
//			if (err) {
//				callback(null, "Lookup error: "+ err);
//			} else if (data.Items === undefined) {
//				callback([], null);
//			} else if (data.Items != undefined){
//				var results = [];
//				for (i = 0; i<data.Items.length; i++){
//					var item = {id: data.Items[i].Name, comments: []};
//					var valid = 0;
//					// check all attributes in item
//				    for (j = 0; j<data.Items[i].Attributes.length; j++){
//				    	var name = data.Items[i].Attributes[j].Name;
//				    	var value = data.Items[i].Attributes[j].Value;
//				    	if (name === 'interest'){
//				    		results.push(value);
//				    	}
//				    }
//				}
//				callback(results, null);
//			} else {
//				callback(null, "err");
//			}
//	   });
//};
//
//var tripDB_addPost = function(poster, name, post, walluser, callback) {
//	var time = new Date().getTime().toString();
//	var id = (poster + time);
//	tripDB_getPermission(poster, walluser, function (data, err){
//		// Check that user is a valid friend
//		// If not don't allow them to post
//		if (data == true) {
//			console.log("Permission granted.");
//			simpledb.putAttributes({
//				DomainName : 'FB_walls',
//				ItemName: id,
//				Attributes : [ {
//					Name : 'Text',
//					Value : post
//				} , {
//					Name : 'Username',
//					Value : walluser
//				} , {
//					Name : 'Poster',
//					Value : '<a href="../wall/'+poster+'">'+name+'</a>'
//				} , {
//					Name : 'Time',
//					Value : time
//				}]
//			}, function (err, data) {
//				if (err) {
//					console.log("error :" + err.toString());
//					callback("error: " + err,null);
//				} else {
//					callback(true, null);
//				}
//			});
//		} else {
//			console.log("Permission denied.");
//			callback(null, "permission");
//		}
//	});
//}
//
//// Commenting
//var tripDB_addComment = function(db, id, name, comment, route_callbck) {
//	console.log('Posting comment');
//	simpledb.getAttributes(
//		{DomainName:db, ItemName: id},
//		function (err, data) {
//			if (err) {
//				route_callbck (null, err);
//			} else if (data != undefined){
//				simpledb.putAttributes({
//					DomainName : db,
//					ItemName: id,
//					Attributes : [ {
//						// Create a new comment attribute
//						Name : "comment",
//						Value : comment
//					}]
//				}, function (err, data) {
//					if (err) {
//						console.log("error:" + err.toString());
//						route_callbck("error: " + err,null);
//					} else if (data){
//						console.log("else");
//						route_callbck(true, null);
//					} else {
//						route_callbck(null, "error");
//					}
//				});
//			};
//		});
//};
//
//// Security
//var tripDB_getPermission = function (me, user, callback) {
//	console.log("Checking permissions");
//	if (!me || !user) callback (false, null);
//	simpledb.getAttributes({DomainName:'FB_user_user', ItemName: me+"."+user},
//	function (err, data) {
//		if (err) callback (false, null);
//		else if (data != undefined)	callback(true, null);
//		else callback (false, null);
//	});
//};
//
//// Homepage Functions
////ProfileUpdates
//var tripDB_getFriendUpdates = function(user, callback){
//	// output form : [{id: # , type: , content: }]
//  console.log('Searching for friend updates');
//    simpledb.select(
//            {SelectExpression: "select * from FB_ProfileUpdates "+
//            				   "where Time > '0' "+
//            				   "and User = '"+user+"' "+
//            				   "order by Time desc "+
//            				   "limit 1",
//            ConsistentRead: true},
//    function (err, data) {
//      if (err) {
//        callback(null, "Lookup error: "+ err);
//      } else if (data === undefined) {
//        callback(null, "empty");
//      } else if (data.Items){
//         var results = [];
//         for (i = 0; i<data.Items.length; i++){
//            var item = {id: data.Items[i].Name, updateType: "profile"};
//            // check all attributes in item
//            for (j = 0; j<data.Items[i].Attributes.length; j++){
//                var name = data.Items[i].Attributes[j].Name;
//                var value = data.Items[i].Attributes[j].Value;
//                if (name === 'Type'){
//                    item.type = value;
//                } else if (name === 'Content'){
//                    item.content = value;
//                }
//            }
//            // if item had all correct attributes, add it to results
//            results.push(item);
//         }
//         } else {
//     	 callback (null, "err");
//         return results;
//      }
//   });
//};
//
//var tripDB_getFriendships = function(user, callback){
//  console.log('Searching for new friendships');
//    simpledb.select(
//            {SelectExpression: "select * from FB_user_user where Time > '0' and User1='"+user+"' order by Time desc limit 2",
//            ConsistentRead: true},
//    function (err, data) {
//      if (err) {
//        callback(null, "Lookup error: "+ err);
//      } else if (data === undefined) {
//        callback(null, "empty");
//      } else if (data.Items != undefined){
//         var results = [];
//         for (i = 0; i<data.Items.length; i++){
//            var item = {};
//            console.log(i);
//            // check all attributes in item
//            for (j = 0; j<data.Items[i].Attributes.length; j++){
//                var name = data.Items[i].Attributes[j].Name;
//                var value = data.Items[i].Attributes[j].Value;
//                if (name === 'User1'){
//                    item.friend1 = value;
//                } else if (name === 'User2') {
//                	item.friend2 = value;
//                }
//                //results.push(item);
//
//	            //if (i = data.Items.length -1) {
//
//	            //}
//            }
//            results.push(item);
//            // if item had all correct attributes, add it to results
//         }
//         console.log("the friends are " + results);
//	     callback(results);
//
//      }
//   });
//};
//
//var tripDB_getNewsfeed = function(user, callback ) {
//	tripDB_getFriendships(user, function (data, err) {
//		if (err) {
//			console.log("error getting friendships for " + user);
//		} else {
//			var counter = 1;
//			var length = data.length;
//
//			var get_news = function (friendObj, inner_callback){
//				friend = friendObj.friend2;
//
//				simpledb.select(
//            		{SelectExpression: "select * from FB_walls where Time > '0' and Username='"+friend+"' order by Time asc limit 10",
//            		ConsistentRead: true},
//    			function (err, data2) {
//      				if (err) {
//        				inner_callback(null, "Error looking up newsfeed: "+ err);
//      				} else if (data2.Items != undefined){
//						 for (i = 0; i<data2.Items.length; i++){
//							var results = [];
//							// check all attributes in item
//							var post = {};
//						    for (j = 0; j<data2.Items[i].Attributes.length; j++){
//						    	var name = data2.Items[i].Attributes[j].Name;
//						    	var value = data2.Items[i].Attributes[j].Value;
//						    	if (name === 'Username'){
//						    		post.username = value;
//						    	} else if (name === 'Poster'){
//						    		post.poster = value;
//						    	} else if (name === 'Text'){
//						    		post.text = value;
//						    	}
//						    }
//					    	results.push(post);
//		 				}
//		 				inner_callback(null, results);
//                	}
//                	else
//                		inner_callback(null, null);
//				});
//			}
//
//			async.map(data, get_news, function(err, data){
//				if (err){
//					console.log(err)
//					callback(err, null);
//				}
//				else{
//					merged = [];
//					for (var i = 0 ; i < data.length; i++)
//						merged = merged.concat(data[i]);
//					console.log(merged);
//					callback(null, merged);
//				}
//			});
//		}
//	});
//};
//
//var tripDB_search = function(fragment, callback) {
//	simpledb.select({
//		SelectExpression: "select * from FB_users "+"" +
//						  "where firstname like '"+fragment+"%' "+
//						  "or lastname like '"+fragment+"%' "+
//						  "limit 10",
//		ConsistentRead: true},
//	function (err, data) {
//		if (data.Items != undefined) {
//			var users = [];
//			for (var i=0; i<data.Items.length; i++){
//				var first="";
//				var last="";
//				for (j = 0; j<data.Items[i].Attributes.length; j++){
//	                var name = data.Items[i].Attributes[j].Name;
//	                var value = data.Items[i].Attributes[j].Value;
//	                if (name === 'firstname'){
//	                    first = value;
//	                } else if (name === 'lastname') {
//	                	last = value;
//	                }
//	            }
//				users.push(first+" "+last);
//			}
//			callback(users, null);
//		} else {
//			callback([],null);
//		}
//	});
//}
//
//var tripDB_getOnline = function(user, callback) {
//	simpledb.select({
//		SelectExpression: "select * from FB_user_user "+"" +
//						  "where User1='"+user+"' "+
//						  "or User2='"+user+"' ",
//		ConsistentRead: true},
//	function (err, data) {
//		if (data.Items != undefined) {
//			var friends = [];
//			for (var i=0; i<data.Items.length; i++){
//				var first="";
//				var last="";
//				for (j = 0; j<data.Items[i].Attributes.length; j++){
//	                var name = data.Items[i].Attributes[j].Name;
//	                var value = data.Items[i].Attributes[j].Value;
//	                if (name === 'firstname'){
//	                    first = value;
//	                } else if (name === 'lastname') {
//	                	last = value;
//	                }
//	            }
//				users.push(first+" "+last);
//			}
//			callback(firends, null);
//		} else {
//			callback([],null);
//		}
//	});
//}
//
//var tripDB_getHomepage = function(user, callback){
//	var results = [];
//	results = results.concat(tripDB_getFriendUpdates (user, callback));
//	results = results.concat(tripDB_getFriendships (user, callback));
//	results = results.concat(tripDB_getStatuses (user, callback));
//	callback (results, null);
//}
///* We define an object with one field for each method. For instance, below we have
//   a 'lookup' field, which is set to the tripDB_lookup function. In routes.js, we can
//   then invoke db.lookup(...), and that call will be routed to tripDB_lookup(...). */
//
//
//var tripDB_addfriend = function (me, user, callback) {
//	var itemname = me + "." + user;
//	var time = new Date().getTime().toString();
//
//	simpledb.putAttributes({
//			DomainName : 'FB_user_user',
//				ItemName: itemname,
//				Attributes : [ {
//					Name : 'User2',
//					Value : me
//				} , {
//					Name : 'User1',
//					Value : user
//				} , {
//					Name : 'Time',
//					Value : time
//				}]
//			}, function (err, data) {
//				if (err) {
//					console.log("error :" + err.toString());
//					callback("error: " + err,null);
//				} else {
//					callback(true, null);
//				}
//			});
//
//
//}
//
//var database = {
//  // Login
//  login: tripDB_login,
//  logout: tripDB_logout,
//  online: tripDB_getOnline,
//  //Account management
//  create: tripDB_addAccount,
//  network: tripDB_updateNetwork,
//  interest: tripDB_addInterest,
//  // Security
//  permission: tripDB_getPermission,
//  // Homepage management
//  getnewfriendships: tripDB_getFriendships,
//  getfriendupdates: tripDB_getFriendUpdates,
//  getstatus: tripDB_getStatuses,
//  // Wall management
//  profile: tripDB_getProfile,
//  getposts: tripDB_getWallPosts,
//  getinterests: tripDB_getInterests,
//  addpost: tripDB_addPost,
//  getNewsfeed: tripDB_getNewsfeed,
//  // Status management
//  addstatus: tripDB_addStatus,
//  addcomment: tripDB_addComment,
//  // Search
//  search: tripDB_search,
//  //add friend
//  addfriend: tripDB_addfriend
//};
//
//module.exports = database;
                                        
