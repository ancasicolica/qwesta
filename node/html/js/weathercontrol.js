/**
 * Created by Christian on 22.09.2014.
 */

var weatherApp = angular.module('weatherApp', []);

weatherApp.controller('WeatherCtrl',['$scope', '$http', '$interval', function($scope, $http, $interval) {
  this.test = 1972;
  this.currentRecord = {
    humitity: "0",
    isRaining: false,
    rain: "0",
    temperature: "0,0",
    timestamp: "2000-01-01T00:00:00.000Z",
    wind: "0,0"
  };

  $interval(function() {
    $scope.data.getCurrentData(null, null);
  }, 10000);
  this.setData = function(data) {
    $scope.parent.currentRecord = data;
  }
  this.initAjax = function() {
    if (this.test == 1972) {
      $scope.data.getCurrentData(null, null);
    }
    this.test = 5;
  }

  $scope.SuccessCallback = this.setData;

  $scope.parent = this;
  $scope.data = {};
  $scope.data.getCurrentData = function(item, event) {

    var responsePromise = $http.get("ajax/current.html", null);
    responsePromise.success(function(data, status, headers, config) {
      $scope.data.fromServer = "Text: " + data + "<br>status:" + status;
      $scope.SuccessCallback(data);
      $scope.tab = 5;
    });
    responsePromise.error(function(data, status, headers, config) {
      alert("AJAX failed!");
    });
    return true;
  }
}]);
