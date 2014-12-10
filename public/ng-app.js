(function(){
    angular.module('trip', [])
    .controller('tripController', ['$scope', '$http', function($scope, $http) {
//          $http.get('/api/user/lizbiz').
//                success(function(data, status, headers, config) {
//                    console.log(data)
//                });
        $http.post('/api/user', {name: 'LizBiz', login: 'lizbiz' , pwd: 'password', affiliation: 'UPenn'}).
            success(function(data, status, headers, config) {
                console.log(data)
            });
    }]);
})();