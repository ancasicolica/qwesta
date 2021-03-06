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


var qwesta = angular.module('qwestaApp', ['pickadate']).config(function (pickadateI18nProvider) {
  pickadateI18nProvider.translations = {
    prev: '<i class="icon-chevron-left"></i> früher',
    next: 'später <i class="icon-chevron-right"></i>'
  }
});

qwesta.controller('QwestaCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
  // this is the path to the qwesta directory on your server
  var qwestaUrl = "http://www.kusti.ch/qwesta/qwestadata.php";

  // Init Charts lib
  initCharts();

  // Set current date and graph
  $scope.initDate = new Date().toDateString();
  $scope.currentGraph = 0;

  // Datepicker configuration
  // http://angular-ui.github.io/bootstrap/#/datepicker
  $scope.startDate = Date.today().toString('yyyy-MM-dd');
  $scope.minDate = Date.today().toString('yyyy-MM-dd');
  $scope.maxDate = Date.today().toString('yyyy-MM-dd');
  $scope.lastSetDate = $scope.startDate;
  $scope.format = 'dd.MM.yyyy';

  $scope.dataType = 'temperature'; // what to show in the data list
  $scope.rawData = []; // raw data read (of any kind)

  // Current weather data
  $scope.data = {
    temperature: 0,
    humidity: 0,
    wind: 0.0,
    rain: 0,
    raindifference: 0
  };
  /**
   * Change method when date is set
   */
  $scope.setDate = function () {
    $scope.lastSetDate = $scope.startDate;
    $scope.set($scope.currentGraph);
  };
  /**
   * Convert the start date to the parameters of the get request
   * @returns {string}
   */
  var setDateParams = function () {
    var start = new Date($scope.startDate);
    return "&day=" + start.getDate() + "&month=" + (start.getMonth() + 1) + "&year=" + start.getFullYear();
  };
  /**
   * Sets the latest possible day for the selected range (offset)
   * @param offset
   */
  var setLatestDate = function (offset) {
    if (!$scope.startDate) {
      return;
    }
    if (Date.today().addDays(offset).compareTo(new Date($scope.startDate)) < 0) {
      $scope.startDate = Date.today().addDays(offset).toString('yyyy-MM-dd');
    }
    else if (Date.today().addDays(offset).compareTo(new Date($scope.lastSetDate)) >= 0) {
      $scope.startDate = $scope.lastSetDate;
    }
    else if (Date.today().addDays(offset).compareTo(new Date($scope.startDate)) >= 0) {
      $scope.startDate = Date.today().addDays(offset).toString('yyyy-MM-dd');
    }
  };
  /**
   * Converts a MySql Time format to a Date. This is only an issue for the Safari Browser which
   * follows a very strict implementation
   * @param date formatted as delivered by MySql: "2014-10-06 03:01:12"
   * @returns {Date} date object
   */
  var convertMySqlTimeToDate = function (date) {
    try {

      var a = date.split(' ');
      var n = new Date(a[0] + 'T' + a[1] + 'Z'); // 2007-12-24T18:21Z
      n.set({minute: 0, second: 0});
      return n;
    }
    catch (e) {
      console.error("Invalid MySQL Date:" + date);
      return new Date(2000, 1, 1);
    }
  };
  /**
   * Sets the correct time in the raw Data
   * @param rawData
   * @returns {*} rawData with validated times
   */
  var validateRawData = function (rawData) {
    for (var i = 0; i < rawData.length; i++) {
      if (rawData[i].ts) {
        rawData[i].tsLocal = convertMySqlTimeToDate(rawData[i].ts);
        rawData[i].localTime = rawData[i].tsLocal.toString("d.M.yy HH:mm");
      }
    }
    return rawData;
  };
  /**
   * Set the temperature chart
   * @param data read from qwestadata.php
   */
  $scope.setTemperatureChart = function (data) {
    $scope.dataType = 'temperature';
    $scope.rawData = validateRawData(data);
    drawTemperatureChart(data);
  };
  /**
   * Set the temperature chart
   * @param data read from qwestadata.php
   */
  $scope.setHumidityChart = function (data) {
    $scope.dataType = 'humidity';
    $scope.rawData = validateRawData(data);
    drawHumidityChart(data);
  };
  /**
   * Set the wind chart
   * @param data read from qwestadata.php
   */
  $scope.setWindChart = function (data) {
    $scope.dataType = 'wind';
    $scope.rawData = validateRawData(data);
    drawWindChart(data);
  };
  /**
   * Set the Rain chart
   * @param data read from qwestadata.php
   */
  $scope.setRainChart = function (data) {
    $scope.dataType = 'rain';
    $scope.rawData = validateRawData(data);
    drawRainChart(data);
  };
  /**
   * Set the chart data to the selected index
   * @param index
   */
  $scope.set = function (index) {
    $scope.currentGraph = index;
    var param = "?view=";
    var callback = null;

    for (var i = 0; i < 12; i++) {
      $("#graph" + i).removeClass("qwesta-stats-selected");
    }
    $("#graph" + index).addClass("qwesta-stats-selected");
    switch (index) {
      case 0:
        setLatestDate(0);
        param += "multi&range=day&temperature" + setDateParams();
        callback = $scope.setTemperatureChart;
        break;

      case 1:
        setLatestDate(-6);
        param += "multi&range=week&temperature" + setDateParams();
        callback = $scope.setTemperatureChart;
        break;

      case 2:
        setLatestDate(-29);
        param += "multi&range=month&temperature" + setDateParams();
        callback = $scope.setTemperatureChart;
        break;

      case 3:
        setLatestDate(0);
        param += "multi&range=day&humidity&day=" + setDateParams();
        callback = $scope.setHumidityChart;
        break;

      case 4:
        setLatestDate(-6);
        param += "multi&range=week&humidity&day=" + setDateParams();
        callback = $scope.setHumidityChart;
        break;

      case 5:
        setLatestDate(-29);
        param += "multi&range=month&humidity&day=" + setDateParams();
        callback = $scope.setHumidityChart;
        break;

      case 6:
        setLatestDate(0);
        param += "multi&range=day&wind&day=" + setDateParams();
        callback = $scope.setWindChart;
        break;

      case 7:
        setLatestDate(-6);
        param += "multi&range=week&wind&day=" + setDateParams();
        callback = $scope.setWindChart;
        break;

      case 8:
        setLatestDate(-29);
        param += "multi&range=month&wind&day=" + setDateParams();
        callback = $scope.setWindChart;
        break;

      case 9:
        setLatestDate(0);
        param += "multi&range=day&rain&day=" + setDateParams();
        callback = $scope.setRainChart;
        break;

      case 10:
        setLatestDate(-6);
        param += "multi&range=week&rain&day=" + setDateParams();
        callback = $scope.setRainChart;
        break;

      case 11:
        setLatestDate(-29);
        param += "multi&range=month&rain&day=" + setDateParams();
        callback = $scope.setRainChart;
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
        $scope.data.rain = data.data[0].raindifference * 3 / 10; // approx .295 is one tick
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
  $scope.getCurrentData(qwestaUrl + "?view=basics", function (data) {
    if (data.success) {
      $scope.minDate = convertMySqlTimeToDate(data.oldest);
      $scope.maxDate = convertMySqlTimeToDate(data.latest);
    }
    console.log(data);
  });
  window.addEventListener("resize", $scope.setDate);
}]);

