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

/**
 * Inits the charts, probably not used
 */
var initCharts = function () {

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
    var b = a[0].split('-');
    var c = a[1].split(':');

    return new Date(parseInt(b[0]), parseInt(b[1]), parseInt(b[2]), parseInt(c[0]), parseInt(c[1]), parseInt(c[2]));
  }
  catch (e) {
    console.error("Invalid MySQL Date:" + date);
    return new Date(2000, 1, 1);
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
        chartData.addColumn('datetime', 'Zeit');
        chartData.addColumn('number', 'Temperatur Min');
        chartData.addColumn('number', 'Temperatur Avg');
        chartData.addColumn('number', 'Temperatur Max');

        // transform received data to chart format
        for (var i = 0; i < temperatureData.length; i++) {
          chartData.addRow([convertMySqlTimeToDate(temperatureData[i].tsLocal), parseFloat(temperatureData[i].temperatureMin), parseFloat(temperatureData[i].temperatureAvg), parseFloat(temperatureData[i].temperatureMax)]);
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
          chartData.addRow([convertMySqlTimeToDate(meteodata[i].tsLocal), parseFloat(meteodata[i].humidityAvg)]);
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