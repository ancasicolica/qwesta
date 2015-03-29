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
 * Create the hAxis options object for the charts
 * @param meteoData array with the data, only the length is really needed (today at least)
 * @returns {{gridlines: {count: *}, minorGridlines: {count: *}}}
 */
function getHaxis(meteoData) {
  var hGridlineNb;
  var hMinorGridlineNb;

  if (meteoData.length < 25) {
    // day
    hGridlineNb = 6;
    hMinorGridlineNb = 3;
  }
  else if (meteoData.length < 32) {
    // month
    hGridlineNb = 6;
    hMinorGridlineNb = 6;
  }
  else {
    // week
    hGridlineNb = 7;
    hMinorGridlineNb = 0;
  }
  var hAxis = {
    gridlines: {
      count: hGridlineNb
    },
    minorGridlines: {
      count: hMinorGridlineNb
    }
  };
  return hAxis;
}
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
        chartData.addColumn('number', 'Minimum');
        chartData.addColumn('number', 'Durchschnitt');
        chartData.addColumn('number', 'Maximum');

        var maximalMeasuredValue = -100;
        var minimalMeasuredValue = 100;

        // transform received data to chart format
        for (var i = 0; i < temperatureData.length; i++) {
          var tempMin = parseFloat(temperatureData[i].temperatureMin);
          var tempMax = parseFloat(temperatureData[i].temperatureMax);
          chartData.addRow([temperatureData[i].tsLocal, tempMin, parseFloat(temperatureData[i].temperatureAvg), tempMax]);
          if (minimalMeasuredValue > tempMin) {
            minimalMeasuredValue = tempMin;
          }
          if (maximalMeasuredValue < tempMax) {
            maximalMeasuredValue = tempMax;
          }
        }

        // 0 is always shown!!
        var minAxis;
        var maxAxis;
        if (maximalMeasuredValue < 0) {
          maxAxis = 0;
        }
        else {
          maxAxis = (Math.floor(maximalMeasuredValue / 5) + 1) * 5;
        }
        if (minimalMeasuredValue > 0) {
          minAxis = 0;
        }
        else {
          minAxis = (Math.floor(Math.abs(minimalMeasuredValue) / 5) + 1) * (0 - 5);
        }

        var gridlineNb = (maxAxis + Math.abs(minAxis)) / 5 + 1;

        var options = {
          curveType: 'function',
          legend: {position: 'bottom'},
          title: "Temperatur [°C]",
          vAxis: {
            minValue: minAxis,
            maxValue: maxAxis,
            gridlines: {
              count: gridlineNb
            },
            minorGridlines: {
              count: 5
            }
          },
          hAxis: getHaxis(temperatureData)

        };
        console.log(screen.width);
        var chart = new google.visualization.LineChart(document.getElementById('chart'));

        chart.draw(chartData, options);
        $('#disclaimer').html('');
      }
    })
  }
};

/**
 * Draws a Humidity chart
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
          chartData.addRow([meteodata[i].tsLocal, parseFloat(meteodata[i].humidityAvg)]);
        }

        var options = {
          title: 'Luftfeuchtigkeit [%]',
          curveType: 'function',
          legend: {position: 'bottom'},
          vAxis: {
            minValue: 0,
            maxValue: 100,
            gridlines: {
              count: 6
            },
            minorGridlines: {
              count: 1
            }
          },
          hAxis: getHaxis(meteodata)
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart'));

        chart.draw(chartData, options);
        $('#disclaimer').html('');
      }
    })
  }
};


/**
 * Draws a Wind chart
 * @param data temperature data
 */
var drawWindChart = function (data) {
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
        chartData.addColumn('number', 'Durchschnitt');
        chartData.addColumn('number', 'Maximum');

        // transform received data to chart format
        for (var i = 0; i < meteodata.length; i++) {
          chartData.addRow([meteodata[i].tsLocal,
            parseFloat(meteodata[i].windAvg),
            parseFloat(meteodata[i].windMax)]);
        }

        var options = {
          title: 'Wind [km/h]',
          curveType: 'function',
          legend: {position: 'bottom'},
          hAxis: getHaxis(meteodata)
        };

        var chart = new google.visualization.AreaChart(document.getElementById('chart'));

        chart.draw(chartData, options);

        // Add disclaimer if needed
        var startDate = meteodata[0].tsLocal;
        if (startDate.getMonth() < 3 || startDate.getMonth() > 9) {
          $('#disclaimer').html('Bei Schneefall ist es möglich, dass der Windsensor ausfällt. <a href="out-of-order.html">Mehr Infos hier.</a>')
        }
      }
    })
  }
};


/**
 * Draws a Rain chart
 * @param data temperature data
 */
var drawRainChart = function (data) {
  if (google) {
    // keep the data in the scope
    var meteodata = data;
    var maxValue = 1;

    // load google module asynchronously, otherwise the screen will be blank!
    google.load('visualization', '1.0', {
      packages: ['corechart'],
      callback: function () {
        var chartData = new google.visualization.DataTable();
        // The colums of the chart
        chartData.addColumn('datetime', 'Zeit');
        chartData.addColumn('number', 'Niederschlag');

        // transform received data to chart format
        for (var i = 0; i < meteodata.length; i++) {
          var rainDiff = parseInt(meteodata[i].rainDiff) * 3 / 10; // approx .295 is one tick
          chartData.addRow([meteodata[i].tsLocal,
            rainDiff]);

          if (rainDiff > maxValue) {
            maxValue = rainDiff;
          }
        }

        var options = {
          title: 'Niederschlag [mm]',
          curveType: 'function',
          legend: {position: 'bottom'},
          backgroundColor: {fill: 'transparent'}, // undocumented google feature...
          vAxis: {minValue: 0, maxValue: maxValue},
          hAxis: getHaxis(meteodata)

        };

        var chart = new google.visualization.ColumnChart(document.getElementById('chart'));

        chart.draw(chartData, options);
        $('#disclaimer').html('Bei Schneefall werden keine Niederschlagsdaten erfasst. <a href="out-of-order.html">Mehr Infos hier.</a>')
      }
    })
  }
};
