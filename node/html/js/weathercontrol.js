/***********************************************************************************/
/*
 File:    weathernode.js
 Purpose: AngularJs controller for the node hosted weather page
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 22.9.14
 Github:  https://github.com/ancasicolica/qwesta

 ----------------------------------------------------------------------------------

 This is free and unencumbered software released into the public domain.

 Anyone is free to copy, modify, publish, use, compile, sell, or
 distribute this software, either in source code form or as a compiled
 binary, for any purpose, commercial or non-commercial, and by any
 means.

 In jurisdictions that recognize copyright laws, the author or authors
 of this software dedicate any and all copyright interest in the
 software to the public domain. We make this dedication for the benefit
 of the public at large and to the detriment of our heirs and
 successors. We intend this dedication to be an overt act of
 relinquishment in perpetuity of all present and future rights to this
 software under copyright law.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

 For more information, please refer to <http://unlicense.org/>

 */
/***********************************************************************************/


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
