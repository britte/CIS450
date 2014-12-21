var api = require('./api.js');
var _ = require('underscore');

var get_login = function(req, res) {
    res.render('login.html')
}

var get_signup = function(req, res) {
    res.render('signup.html')
}

var get_index = function(req, res) {
    res.render('index.html', {user: req.session.user})
}

var get_partials = function(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

var routes = {
    index: get_index,
    partials: get_partials,

    login: get_login,
    signup: get_signup
}

module.exports = routes;