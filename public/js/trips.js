var tripApp = angular.module('trip')

tripApp.controller('AddTripCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/trip/'+$routeParams.trip)
        .success(function(trip) {
            console.log(trip)
            $scope.trip = trip;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.addTrip = function() {
        trip = {
            name: $scope.name,
            location: $scope.location
        }
        $http.post('/api/post-trip', trip)
            .success(function(trip) {
                $location.path('/trip/' + trip.ID);
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
});

tripApp.controller('EditTripCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/trip/'+$routeParams.trip)
        .success(function(trip) {
            $scope.trip = trip;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $scope.editTrip = function() {
        $http.post('/api/post-trip-edit/'+$scope.trip.ID, $scope.trip)
            .success(function(trip) {
                $location.path('/trip/' + $scope.trip.ID);
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
});

tripApp.controller('TripCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/trip/'+$routeParams.id)
        .success(function(trip) {
            $scope.trip = trip;
            $scope.canEdit = trip.OWNER == $scope.currentUser.ID;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $http.get('/api/trip-invited/'+$routeParams.id)
        .success(function(invited) {
            console.log(invited)
            $scope.confirmed = _.filter(invited, function(i){return i.STATUS == 1});
            $scope.pending = _.filter(invited, function(i){return i.STATUS == 0});
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $http.get('/api/friends')
        .success(function(uninvited) {
            console.log(uninvited)
            $scope.uninvited = uninvited;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.inviteFriend = function(fid) {
        $http.post('/api/invite-trip/'+$scope.trip.ID+'/'+fid)
            .success(function(uninvited) {
                console.log('Success')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

});

tripApp.controller('TripsCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/trips')
        .success(function(trips) {
            console.log(trips)
            $scope.trips = trips;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $http.get('/api/friend-trips')
        .success(function(trips) {
            console.log(trips)
            $scope.friend_trips = trips;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
});