var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db;
var assert = require('assert');

// Connection URL
// var url = 'mongodb://127.0.0.1:27017/';
// var media = {
// 	id: 0,
// 	media_url: "britneyspears"
// };
// var media2 = {
// 	id: 1,
// 	media_url: "britneyspears"
// };
// var media3 = {
// 	id: 2,
// 	media_url: "britneyspears"
// };
// var medias = [media, media2, media3];

//Use connect method to connect to the Server
// MongoClient.connect(url, {native_parser:true}, function(err, db) {
// 	if (err) {
// 		console.log("qq: " + err);
// 	}
//   	console.log("Connected correctly to server");
//   	insertDocuments(db, medias, function() {
//         findDocuments(db, function() {
        	// removeDocument(db, function(){
        	// 	updateDocument(db, function(){
        	// 		findDocuments(db, function(){
        			// 	db.close();
        			// });
        	// 	});
        	// });
 //        });
	// });

//});

var insertDocuments = function(db, medias, callback) {
  // Get the documents collection

  var collection = db.collection('documents');
  // Insert some documents
  collection.insert([{id: medias[0].id, url : medias[0].media_url.toString()},
  					 {id: medias[1].id, url : medias[1].media_url.toString()},
  					 {id: medias[2].id, url : medias[2].media_url.toString()}],
  					function(err, result) {
  						if(err){
  							console.log(err);
  						} else{
    						console.log("Inserted 3 documents into the document collection");
    						callback(result);
    					}
  					});
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    console.dir(docs)
    callback(docs);
  });      
}

var removeDocument = function(db, media, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.remove({id: media.id, url : media.media_url.toString() }, function(err, result) {
    console.log("Removed the document with the field id mapping to media_url");
    callback(result);
  });    
}

var updateDocument = function(db, media1, media2, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.update({id: media1.id, url : media1.media_url.toString() }
    , { $set: {id: media2.id, url : media2.media_url.toString() } }, function(err, result) {
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });  
}

var mangos = {
  insertTrio: insertDocuments,
  getAll: findDocuments,
  remove: removeDocument,
  update: updateDocument
};

module.exports = mangos;