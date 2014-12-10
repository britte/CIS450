var express = require('express');
var app = express();

var api = require('./routes/api.js');
var routes = require('./routes/routes.js');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Page fetch routes (load data after html load)
app.get('/', routes.main);

// API routes
app.get('/api/user/:login', api.get_user);
app.post('/api/user', api.post_user);

// listen on port 8081
app.listen(8081);