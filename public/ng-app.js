angular.module('trip', [])
.controller('tripCtrl', function($scope) {
  $scope.test = function(msg) {
    alert(msg)
  }
})