var tripApp = angular.module('trip')

tripApp.controller('AddAlbumCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/album/'+$routeParams.album)
        .success(function(album) {
            $scope.album = album;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });

    $scope.addAlbum = function() {
        album = {
            name: $scope.name,
            trip: $scope.trip
        }
        $http.post('/api/post-album', album)
            .success(function(album) {
                $location.path('/album/' + album.ID);
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
});

tripApp.controller('EditAlbumCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/album/'+$routeParams.album)
            .success(function(album) {
                $scope.album = album;
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    $scope.editAlbum = function() {
        $http.post('/api/post-album-edit/'+$scope.album.ID, $scope.album)
            .success(function(album) {
                $location.path('/album/' + $scope.album.ID);
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
});

tripApp.controller('AlbumCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/album/'+$routeParams.id)
        .success(function(album) {
            $scope.album = album;
            $scope.canEdit = album.OWNER == $scope.currentUser.ID;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $scope.addMedia = function(){
        media = {
            url: $scope.url,
            video: !!$scope.video,
            private: !!$scope.video
        }
        $http.post('/api/post-media/'+$scope.album.ID, media)
            .success(function() {
                console.log('Success')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }
});

tripApp.controller('AlbumsCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/albums')
        .success(function(albums) {
            $scope.albums = albums.user;
            $scope.trip_albums = albums.trip;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
});

tripApp.controller('MediaCtrl', function($scope, $http, $routeParams, $location) {
    $http.get('/api/media/'+$routeParams.id)
        .success(function(media) {
            $scope.media = media;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $scope.rateMedia = function(){
        $http.post('/api/post-media-rating/'+$scope.media.ID, {rating: $scope.rating})
            .success(function() {
                console.log('Success')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }

    $scope.commentMedia = function(){
        $http.post('/api/post-media-comment/'+$scope.media.ID, {comment: $scope.comment})
            .success(function() {
                console.log('Success')
            })
            .error(function(err) {
                $scope.err = true;
                $scope.errMsg = err.msg;
            });
    }
});