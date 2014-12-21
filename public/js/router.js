var tripApp = angular.module('trip')

// Renders pages and connects them to individual controller
tripApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.
            when('/', {
                templateUrl: '/partials/checklist.html',
                controller: 'MainCtrl'
            }).
            when('/login', {
                templateUrl: '/partials/login.html',
                controller: 'LoginCtrl'
            }).
            when('/signup', {
                templateUrl: '/partials/signup.html',
                controller: 'SignupCtrl'
            }).
            when('/homepage/:login', {
                templateUrl: '/partials/homepage.html',
                controller: 'HomeCtrl'
            }).
            when('/user-edit', {
                templateUrl: '/partials/user-edit.html',
                controller: 'UserEditCtrl'
            }).
            when('/add-trip', {
                templateUrl: '/partials/add-trip.html',
                controller: 'AddTripCtrl'
            }).
            when('/trip-edit/:trip', {
                templateUrl: '/partials/edit-trip.html',
                controller: 'EditTripCtrl'
            }).
            when('/trip/:id', {
                templateUrl: '/partials/trip.html',
                controller: 'TripCtrl'
            }).
            when('/trips', {
                templateUrl: '/partials/trips.html',
                controller: 'TripsCtrl'
            }).
            when('/add-album', {
                templateUrl: '/partials/add-album.html',
                controller: 'AddAlbumCtrl'
            }).
            when('/album-edit/:album', {
                templateUrl: '/partials/edit-album.html',
                controller: 'EditAlbumCtrl'
            }).
            when('/album/:id', {
                templateUrl: '/partials/album.html',
                controller: 'AlbumCtrl'
            }).
            when('/albums', {
                templateUrl: '/partials/albums.html',
                controller: 'AlbumsCtrl'
            }).
            when('/media/:id', {
                templateUrl: '/partials/media.html',
                controller: 'MediaCtrl'
            }).
            when('/friends', {
                templateUrl: '/partials/friends.html',
                controller: 'FriendsCtrl'
            }).
            when('/pending', {
                templateUrl: '/partials/pending.html',
                controller: 'PendingCtrl'
            });
    }]);