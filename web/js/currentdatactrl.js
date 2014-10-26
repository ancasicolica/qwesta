/***********************************************************************************/
/*
 File:    currentdatactrl.js
 Purpose: AngularJs controller for the current weather
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 23.10.14
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


var currentWeather = angular.module('currentWeatherApp', []);

currentWeather.controller('CurrentDataCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
  this.hello = "world";
  $scope.test = 1;
  $scope.data = {
    temperature: 0
  };

  $scope.message = "";
  /**
   * Gets the current data from the webserver over an ajax call
   * @param url the url to retrieve
   * @param callback will be called afterwards
   * @returns {boolean}
   */
  this.getCurrentData = function (url, callback) {

    var responsePromise = $http.get(url, null);
    // Success handling
    responsePromise.success(function (data, status, headers, config) {
      this.hello = "Text: " + data + "<br>status:" + status;
      callback(data);
    });
    // Error handling
    responsePromise.error(function (data, status, headers, config) {
      //alert("AJAX failed!");
    });
    return true;
  };

  this.scope = $scope;

  this.currentDataCallback = function (data) {
    if (data.success) {
      $scope.data = data.data[0];
    }
    else {
      $scope.data.temperature = -1;
    }
    console.log(data);
    $scope.test++;
    $scope.message = data.message;
  };
  this.getCurrentData('http://www.kusti.ch/qwesta/qwestadata.php?view=current', this.currentDataCallback);
}]);
