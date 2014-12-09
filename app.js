var express = require('express');
var routes = require('./routes/routes.js');
var app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.get('/', routes.api.users);

// listen on port 8081
app.listen(8081);