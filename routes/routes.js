var get_main = function(req, res) { res.render('index', {}) }

var routes = {
    main: get_main
};

module.exports = routes;