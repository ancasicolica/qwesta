/**
 * Created by Christian on 22.09.2014.
 */

var weatherApp = angular.module('weatherApp', []);

weatherApp.controller('WeatherCtrl',['$scope', '$http', '$interval', function($scope, $http, $interval) {

  // This entry contains the current record
  this.currentRecord = {
    humidity: 0,
    isRaining: false,
    rain: 0,
    temperature: 0.0,
    timestamp: "2000-01-01T00:00:00.000Z",
    wind: 0.0
  };

  this.records;

  this.temperatureTrendImage = "img/no_data.png";
  this.humidityTrendImage = "img/no_data.png";

  /**
   * The interval timer retrieving the data
   */
  var timer = $interval(function() {
    $scope.data.getCurrentData(null, null);
  }, 10000);


  /**
   * Sets the data read from the ajax call
   * @param data
   */
  this.setData = function(data) {
    $scope.parent.records = data;
    var cr = data[data.length - 1]
    $scope.parent.currentRecord = cr;

    // Analysis
    if (data.length > 1) {
      var temperatureAvg = 0.0;
      var humidityAvg = 0.0;
      for (var i = 0; i < data.length; i++) {
        temperatureAvg += data[i].temperature;
        humidityAvg += data[i].humidity;
      }
      temperatureAvg /= data.length;
      humidityAvg /= data.length;

      // TODO: better algorithm, is to exact now
      console.log("avg temp: " + temperatureAvg);
      console.log("cur temp: " + cr.temperature);
      if (cr.temperature > temperatureAvg) {
        $scope.parent.temperatureTrendImage = "img/arrow_right_up.png";
      }
      else if (cr.temperature < temperatureAvg) {
        $scope.parent.temperatureTrendImage = "img/arrow_right_down.png";
      }
      else {
        $scope.parent.temperatureTrendImage = "img/arrow_right.png";
      }

      if (cr.humidity > temperatureAvg) {
        $scope.parent.humidityTrendImage = "img/arrow_right_up.png";
      }
      else if (cr.humidity < temperatureAvg) {
        $scope.parent.humidityTrendImage = "img/arrow_right_down.png";
      }
      else {
        $scope.parent.humidityTrendImage = "img/arrow_right.png";
      }
    }
  };

  $scope.SuccessCallback = this.setData;

  $scope.parent = this;
  $scope.data = {};
  $scope.data.getCurrentData = function(item, event) {

    var responsePromise = $http.get("ajax/current.html", null);
    // Success handling
    responsePromise.success(function(data, status, headers, config) {
      $scope.data.fromServer = "Text: " + data + "<br>status:" + status;
      $scope.SuccessCallback(data);
      $scope.tab = 5;
    });
    // Error handling
    responsePromise.error(function(data, status, headers, config) {
      //alert("AJAX failed!");
    });
    return true;
  }
  // immediately request current data
  $scope.data.getCurrentData(null, null);
}]);
