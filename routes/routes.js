var api = require('./api.js');
var _ = require('underscore');

var get_index = function(req, res) {
    res.render('index.ejs', {user: req.session.user})
}

var get_partials = function(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

var routes = {
    index: get_index,
    partials: get_partials
}

module.exports = routes;