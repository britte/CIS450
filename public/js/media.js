var tripApp = angular.module('trip')

tripApp.controller('AddAlbumCtrl', function($scope, $http, $routeParams, $location) {
    $scope.album = {}
    $scope.addAlbum = function() {
        console.log($scope.album)
        $http.post('/api/post-album', $scope.album)
            .success(function(album) {
                console.log(album)
                window.location = '/album/' + album.id;
            })
            .error(function(err){
                 $scope.err = true;
                 $scope.errMsg = err.msg;
            })
    }
    $scope.search = {}
    $scope.searchTrips = function () {
        $http.post('/api/search/trips', { query: $scope.search.query })
            .success(function(results) {
                console.log(results)
                $scope.search.results = results;
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
            console.log(album)
            $scope.album = album.album;
            $scope.media = album.media;
            $scope.canEdit = album.OWNER == $scope.currentUser.ID;
        })
        .error(function(err) {
            $scope.err = true;
            $scope.errMsg = err.msg;
        });
    $scope.media = {}
    $scope.addMedia = function(){
        console.log($scope.media)
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
            $scope.u_albums = albums.user;
            $scope.t_albums = albums.trip;
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