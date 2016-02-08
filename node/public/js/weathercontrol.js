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

weatherApp.controller('WeatherCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.stationName = "Wetterstation";
  $scope.iconFolder  = "./img/icon32/";

  $scope.records = [];

  $scope.temperatureTrendImage   = $scope.iconFolder + "arrow456.png";
  $scope.humidityTrendImage      = $scope.iconFolder + "arrow456.png";
  $scope.temperatureDataCallback = $scope.drawTemperatureChart;
  $scope.humidityDataCallback    = $scope.drawHumidityChart;
  $scope.data                    = {};

  // This entry contains the current record
  $scope.currentRecord = {
    humidity      : 0,
    isRaining     : false,
    rain          : 0,
    temperature   : 0.0,
    timestamp     : "2000-01-01T00:00:00.000Z",
    wind          : 0.0,
    rainDifference: 0.0
  };

  // Init data when document is ready
  $(document).ready(function () {
    console.log('document ready');
    $scope.data.getCurrentData('measurements/current', setData);


    $scope.socket = io.connect();

    $scope.socket.on('connect', function () {
      console.log('Socket connected');
    });

    $scope.socket.on('weatherdata', function (data) {
      console.log(data);
      setData(data);
      $scope.$apply();
    });
  });


  $scope.getCurrentRecordTime = function () {
    var d = new Date($scope.currentRecord.timestamp);
    var s = d.toLocaleTimeString();
    return s;
  };


  /**
   * Sets the data read from the ajax call
   * @param data
   */
  var setData = function (data) {
    $scope.records.push(data);
    var cr               = data;
    $scope.currentRecord = cr;

    // Analysis
    if ($scope.records.length > 3) {
      // Evaluate average of temperature and humidity while removing the highest
      // and lowest value
      var temperatureAvg = 0.0;
      var humidityAvg    = 0.0;
      var humidityMax    = 0.0;
      var humidityMin    = 99.9;
      var temperatureMax = -50.0;
      var temperatureMin = 99.0;

      for (var i = 0; i < data.length; i++) {
        temperatureAvg += $scope.records[i].temperature;
        humidityAvg += $scope.records[i].humidity;
        if (humidityMax < $scope.records[i].humidity) {
          humidityMax = $scope.records[i].humidity;
        }
        if (humidityMin > $scope.records[i].humidity) {
          humidityMin = $scope.records[i].humidity;
        }
        if (temperatureMax < $scope.records[i].temperature) {
          temperatureMax = $scope.records[i].temperature;
        }
        if (temperatureMin > $scope.records[i].temperature) {
          temperatureMin = $scope.records[i].temperature;
        }

      }
      temperatureAvg = (temperatureAvg - temperatureMax - temperatureMin) / ($scope.records.length - 2);
      humidityAvg    = (humidityAvg - humidityMax - humidityMin) / ($scope.records.length - 2);

      // TODO: better algorithm, is to exact now
      console.log("avg temp: " + temperatureAvg);
      console.log("cur temp: " + cr.temperature);
      if (cr.temperature > temperatureAvg) {
        $scope.temperatureTrendImage = $scope.iconFolder + "arrow448.png";
      }
      else if (cr.temperature < temperatureAvg) {
        $scope.temperatureTrendImage = $scope.iconFolder + "arrow453.png";
      }
      else {
        $scope.temperatureTrendImage = $scope.iconFolder + "arrow456.png";
      }

      if (cr.humidity > temperatureAvg) {
        $scope.humidityTrendImage = $scope.iconFolder + "arrow448.png";
      }
      else if (cr.humidity < temperatureAvg) {
        $scope.humidityTrendImage = $scope.iconFolder + "arrow453.png";
      }
      else {
        $scope.humidityTrendImage = $scope.iconFolder + "arrow456.png";
      }
    }
  };


  /**
   * Start the ajax call to load the temperature data
   */
  $scope.loadTemperatureChart = function () {
    $scope.data.getCurrentData('measurements/temperatures', $scope.temperatureDataCallback);
  };


  /**
   * Draw the temperature chart
   * @param data loaded temperature data
   */
  $scope.drawTemperatureChart = function (data) {
    console.log(data);
    // drawTemperatureChart(data);
  };


  /**
   * Start the ajax call to load the humidity data
   */
  $scope.loadHumidityChart = function () {
    $scope.data.getCurrentData('measurements/humidity', $scope.humidityDataCallback);
  };


  /**
   * Draw the humidity chart
   * @param data loaded temperature data
   */
  $scope.drawHumidityChart = function (data) {
    console.log(data);
    // drawHumidityChart(data);
  };


  /**
   * Gets the current data from the webserver over an ajax call
   * @param url the url to retrieve
   * @param callback will be called afterwards
   * @returns {boolean}
   */
  $scope.data.getCurrentData = function (url, callback) {

    $http({method: 'GET', url: url}).then(
      function (resp) {
        // OK
        $scope.data.fromServer = "Text: " + resp.data + "<br>status:" + resp.status;
        callback(resp.data);
      },
      function (resp) {
        // Error
        console.error(resp);
      }
    );
  };
  // immediately request current data
  $scope.data.getCurrentData('measurements/current', setData);
}]);
