var tripApp = angular.module('trip', ['ngRoute'])

tripApp.controller('MainCtrl', function($scope, $http){
    $http.get('/api/session').success(function(s){
        console.log(s.user)
        $scope.currentUser = s.user
    })

})

tripApp.controller('LoginCtrl', function($scope, $http, $location) {
    $scope.login = function() {
        $http.get('/api/login/' + $scope.user + '/' + $scope.pwd)
            .success(function(user) {
                console.log('Logged in ' + user.NAME)
                $scope.currentUser = user;
                $location.path('/homepage/' + user.LOGIN);
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
                $location.path('/homepage/' + user.login);
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
    $scope.edit = function() {
        if ($scope.old_pwd != $scope.currentUser.PWD) {
            $scope.err = true;
            $scope.errMsg = 'Incorrect password.';
            return
        }

        var update_pwd = function(){
            if ($scope.new_pwd_1 || $scope.new_pwd_2) {
                if ($scope.new_pwd_1 && $scope.new_pwd_2 &&
                    $scope.new_pwd_1 == $scope.new_pwd_2) {
                    return $scope.new_pwd
                } else {
                    return null
                }
            } else {
                return $scope.currentUser.PWD
            }
        }

        user = {
            name: $scope.name,
            affiliation: $scope.affiliation,
            pwd: update_pwd()
        }
        if (user.pwd) {
            $http.post('/api/user-edit', user)
                .success(function(data) {
                    $location.path('/homepage/' + user.login);
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
            $scope.trips = pending.trip;
            $scope.friends = pending.friends;
            console.log(pending)
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.confirmInvite(tid) = function(){
        $http.post('/api/confirm-invite/'+tid)
            .success(function() {
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.rejectInvite(tid) = function(){
        $http.post('/api/reject-invite/'+tid+'/'+currentUser.ID)
            .success(function() {
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.confirmRequest(fid) = function(){
        $http.post('/api/confirm-request/'+fid)
            .success(function() {
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.rejectRequest(fid) = function(){
        $http.post('/api/reject-request/'+fid)
            .success(function() {
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
            console.log(pending)
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $http.get('/api/friend-recs')
        .success(function(friends) {
            $scope.recs = recs;
            console.log(pending)
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.requestFriend(fid) = function(){
        $http.post('/api/request-friend/'+fid)
            .success(function() {
                console.log('Confirmed')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

});