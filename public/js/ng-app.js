var tripApp = angular.module('trip', ['ngRoute'])

tripApp.controller('MainCtrl', function($scope, $http){
    $http.get('/api/session')
        .success(function(s){
            $scope.currentUser = s.user
        })

    $http.get('/api/pending')
        .success(function(pending){
            $scope.pending = _.union(pending.friends, pending.trips);
            $scope.numPending = $scope.pending.length;
            console.log(pending)
            console.log($scope.pending)
        })

    $scope.logout = function() {
        $http.get('/api/logout')
            .success(function(err){
                window.location = '/login'
            })
            .error(function(err){
                alert(err.msg)
                $scope.err = true;
                $scope.errMsg = err.msg;
            })
    }
    $scope.search = {}
    $scope.sidebarSearch = function() {
        window.location = '/search/'+$scope.search.query;
    }
})

tripApp.controller('LoginCtrl', function($scope, $http, $location) {
    $scope.login = function() {
        $http.get('/api/login/' + $scope.user + '/' + $scope.pwd)
            .success(function(user) {
                console.log('Logged in ' + user.NAME)
                $scope.currentUser = user;
                window.location = '/homepage/' + user.LOGIN;
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
});

tripApp.controller('SignupCtrl', function($scope, $http, $location) {
    $scope.signup = function() {
        user = {
            name: $scope.name,
            login: $scope.login,
            affiliation: $scope.affiliation,
            pwd: $scope.pwd
        }
        $http.post('/api/signup/', user)
            .success(function(data) {
                console.log('Signed up ' + user.login)
                window.location = '/homepage/' + user.login;
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
});

tripApp.controller('HomeCtrl', function($scope, $http, $routeParams) {
    $scope.canEdit = ($scope.currentUser && $scope.currentUser.LOGIN == $routeParams.login);
    $scope.private = false;

    $http.get('/api/user/' + $routeParams.login)
        .success(function(user) {
            $scope.user = user;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $http.get('/api/newsfeed/' + $routeParams.login)
        .success(function(data) {
            console.log(data)
            $scope.news = _.sortBy(data, function(n){ return -n.TS })
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
});

tripApp.controller('UserEditCtrl', function($scope, $http, $location) {
    $scope.user = {
        name: $scope.currentUser.NAME,
        affiliation: $scope.currentUser.AFFILIATION
    }
    $scope.edit = function() {
        if ($scope.user.old_pwd != $scope.currentUser.PWD) {
            $scope.err = true;
            $scope.errMsg = 'Current password not valid.';
            return
        }

        var update_pwd = function(){
            var user = $scope.user;
            if (user.new_pwd_1 || user.new_pwd_2) {
                if (user.new_pwd_1 && user.new_pwd_2 &&
                    user.new_pwd_1 == user.new_pwd_2) {
                    return user.new_pwd
                } else {
                    return null
                }
            } else {
                return $scope.currentUser.PWD
            }
        }

        $scope.user.pwd = update_pwd();

        if ($scope.user.pwd) {
            $http.post('/api/user-edit', $scope.user)
                .success(function(data) {
                    window.location = '/homepage/' + $scope.currentUser.LOGIN;
                })
                .error(function(err){
                     $scope.err = true;
                     $scope.errMsg = err.msg;
                })
        } else {
            $scope.err = true;
            $scope.errMsg = 'New passwords do not match';
        }
    }
});

tripApp.controller('PendingCtrl', function($scope, $http, $routeParams) {
    $http.get('/api/pending')
        .success(function(pending) {
            $scope.trips = pending.trips;
            $scope.friends = pending.friends;
            console.log(pending)
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.confirmInvite = function(t){
        $http.post('/api/confirm-invite/'+t.ID)
            .success(function() {
                $scope.trips = _.without($scope.trips, t)
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.rejectInvite = function(t){
        $http.post('/api/reject-invite/'+t.ID+'/'+currentUser.ID)
            .success(function() {
                $scope.trips = _.without($scope.trips, t)
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.confirmRequest = function(f){
        $http.post('/api/confirm-request/'+f.ID)
            .success(function() {
                $scope.friends = _.without($scope.friends, f)
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.rejectRequest = function(f){
        $http.post('/api/reject-request/'+f.ID)
            .success(function() {
                $scope.friends = _.without($scope.friends, f)
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }
});

tripApp.controller('FriendsCtrl', function($scope, $http, $routeParams) {
    $http.get('/api/friends')
        .success(function(friends) {
            $scope.friends = friends;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $http.get('/api/friend-recs')
        .success(function(recs) {
            $scope.recs = recs;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.requestFriend = function(f){
        $http.post('/api/request-friend/'+f.ID)
            .success(function() {
                f.FRIEND_DATE = 'Just a moment ago'
                $scope.recs = _.without($scope.recs, f)
                $scope.friends.push(f)
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

});

tripApp.controller('SearchCtrl', function($scope, $http, $routeParams) {
    $scope.query = $routeParams.query;
    $http.post('/api/search/', {query: $routeParams.query})
        .success(function(results) {
            $scope.results = results;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
});