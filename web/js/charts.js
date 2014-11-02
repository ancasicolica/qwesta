/*
 File:    charts.js
 Purpose: Draws all the nice charts
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 31.10.14
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

// Global variable containing charts settings
var qwestaChartsSettings = {};

var initCharts = function () {
  var ua = navigator.userAgent.toLowerCase();
  console.log(ua);
  if (ua.indexOf('safari') != -1) {
    if (ua.indexOf('chrome') > -1) {
      // Google Chrome
      qwestaChartsSettings.useDateTime = true;
    } else {
      // Safari does not handle date time in X axis correctly
      qwestaChartsSettings.useDateTime = false;
    }
  }
  else {
    // All other browsers hopefully support this...
    qwestaChartsSettings.useDateTime = true;
  }
};
/**
 * Returns the data type for the X axis. Chrome (and others) accept datetime while
 * the safari can't handle it
 * @returns {string}
 */
var getTimeAxisDataType = function () {
  if (qwestaChartsSettings.useDateTime) {
    return 'datetime';
  }
  else {
    return 'string';
  }
};
/**
 * Return the correct format for the X Axis time
 * @param date
 * @returns {*}
 */
var getTimeAxisValue = function (date) {
  if (qwestaChartsSettings.useDateTime) {
    return new Date(date);
  }
  else {
    return date;
  }
};
/***********************************************************************************/
/**
 * Draws a temperature chart
 * @param data temperature data
 */
var drawTemperatureChart = function (data) {
  if (google) {
    // keep the data in the scope
    var temperatureData = data;

    // load google module asynchronously, otherwise the screen will be blank!
    google.load('visualization', '1.0', {
      packages: ['corechart'],
      callback: function () {
        var chartData = new google.visualization.DataTable();
        // The colums of the chart
        chartData.addColumn(getTimeAxisDataType(), 'Zeit');
        chartData.addColumn('number', 'Temperatur Min');
        chartData.addColumn('number', 'Temperatur Avg');
        chartData.addColumn('number', 'Temperatur Max');

        // transform received data to chart format
        for (var i = 0; i < temperatureData.length; i++) {
          chartData.addRow([getTimeAxisValue(temperatureData[i].tsLocal), parseFloat(temperatureData[i].temperatureMin), parseFloat(temperatureData[i].temperatureAvg), parseFloat(temperatureData[i].temperatureMax)]);
        }

        var options = {
          curveType: 'function',
          legend: {position: 'bottom'},
          title: "Temperatur"
          //backgroundColor: {fill: 'transparent'} // undocumented google feature...
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart'));

        chart.draw(chartData, options);
      }
    })
  }
};


var chartTest = function () {

};

/**
 * Draws a temperature chart
 * @param data temperature data
 */
var drawHumidityChart = function (data) {
  if (google) {
    // keep the data in the scope
    var meteodata = data;

    // load google module asynchronously, otherwise the screen will be blank!
    google.load('visualization', '1.0', {
      packages: ['corechart'],
      callback: function () {
        var chartData = new google.visualization.DataTable();
        // The colums of the chart
        chartData.addColumn('datetime', 'Zeit');
        chartData.addColumn('number', 'Luftfeuchtigkeit in %');


        // transform received data to chart format
        for (var i = 0; i < meteodata.length; i++) {
          chartData.addRow([new Date(meteodata[i].tsLocal), parseFloat(meteodata[i].humidityAvg)]);
        }

        var options = {
          curveType: 'function',
          legend: {position: 'bottom'},
          backgroundColor: {fill: 'transparent'} // undocumented google feature...
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart'));

        chart.draw(chartData, options);
      }
    })
  }
};