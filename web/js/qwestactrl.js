/***********************************************************************************/
/*
 File:    qwestactrl.js
 Purpose: AngularJs controller for the qwesta weather main page
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 29.10.14
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


var qwesta = angular.module('qwestaApp', []);

qwesta.controller('QwestaCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
  // this is the path to the qwesta directory on your server
  var qwestaUrl = "http://www.kusti.ch/qwesta/qwestadata.php";

  // Current weather data
  $scope.data = {
    temperature: 0,
    humidity: 0,
    wind: 0.0,
    rain: 0
  }

  /**
   * Set the chart data to the selected index
   * @param index
   */
  $scope.set = function (index) {
    var param = "?view=";
    var now = new Date();
    var callback = null;

    switch (index) {
      case 0:
        param += "dataByDay&day=" + now.getDate() + "&month=" + (now.getMonth() + 1) + "&year=" + now.getFullYear();
        callback = drawTemperatureChart;
        break;

      case 4:
        param += "dataByDay&day=" + now.getDate() + "&month=" + (now.getMonth() + 1) + "&year=" + now.getFullYear();
        callback = drawHumidityChart;
        break;

      default:
        return;
    }

    var url = qwestaUrl + param;
    $scope.getCurrentData(url, function (data) {
      callback(data.data);
    });

  };

  /**
   * Get the current (latest) values
   */
  $scope.getCurrentValues = function () {
    $scope.getCurrentData(qwestaUrl + "?view=current", function (data) {
      console.log(data);
      if (data.success) {
        $scope.data.temperature = data.data[0].temperature;
        $scope.data.humidity = data.data[0].humidity;
        $scope.data.wind = data.data[0].wind;
        $scope.data.rain = data.data[0].raindifference;
      }
      else {
        $scope.data.temperature = 0;
        $scope.data.humidity = 0;
        $scope.data.wind = 0;
        $scope.data.rain = 0;
      }
    });
  };

  /**
   * AJAX call to the webserver in order to retrieve the data
   * @param url
   * @param callback
   * @returns {boolean}
   */
  $scope.getCurrentData = function (url, callback) {
    console.log("URL:" + url);
    var responsePromise = $http.get(url, null);
    // Success handling
    responsePromise.success(function (data, status, headers, config) {
      callback(data);
    });
    // Error handling
    responsePromise.error(function (data, status, headers, config) {
      //alert("AJAX failed!");
    });
    return true;
  };

  // Initialize
  $scope.getCurrentValues();
  $scope.set(0);
}]);

