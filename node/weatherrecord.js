/***********************************************************************************/
/*
 File:    weatherrecord.js
 Purpose: Holds the records received from the weatherstation
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

// Format: $1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0
module.exports = {
  /**
   * Creates a new record
   * @param record as read from the serial interface
   * @returns {*}
   */
  newRecord: function(record) {
    return addNewRecord(record);
  },
  /**
   * Returns the current record as JSON string
   * @returns {*}
   */
  getCurrentRecord: function() {
    return JSON.stringify(currentRecord);
  },
  getAllRecords: function() {
    return JSON.stringify(measurements);
  },
  startSimulator: function() {
    startSimTimer();
  },
  stopSimulator: function() {
    stopSimTimer();
  }
};

var measurements = new Array();
/***********************************************************************************/
/**
 * Adds a new record to the measurement list
 * @param record
 * @returns {*}
 */
var addNewRecord = function(record) {
  try {
    var rec = record.toString();
    var wr = new WeatherRecord(rec);
    console.log("New record!");
    currentRecord = wr;
    // our measurements list has max 5 entries
    measurements.push(wr);
    if (measurements.length > 4) {
      measurements.shift();
    }
    return wr;
  }
  catch (e) {
    console.error("newRecord exception: " + e);
    return null;
  }
}

var currentRecord = null;


/***********************************************************************************/
/**
 * Class for one single record
 * @param record as read from the serial interface
 * @constructor
 */
var WeatherRecord = function(record) {
  var elements = record.split(";");
  if ((elements[0] != "$1") || (elements.length != 25)) {
    throw "Malformed record:" + record;
  }
  this.timestamp = new Date();
  this.temperature = parseFloat(elements[19].replace(/[,]/g,'.'));
  this.humidity = parseInt(elements[20]);
  this.wind = parseFloat(elements[21].replace(/[,]/g,'.'));
  this.rain = parseInt(elements[22]);  // 1 tick is approx 295 ml/m2
  this.isRaining = (elements[23] == "1");
}
/**
 * toString override
 * @returns {string}
 */
WeatherRecord.prototype.toString = function () {
  return this.timestamp + " T:" + this.temperature + " H:" + this.humidity + "% W:"
    + this.wind + " R:" + this.rain + " iR:" + this.isRaining;
}
/*
 var d = new WeatherRecord("$1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0");
 console.log(d.toString());
 */

/***********************************************************************************/
var simTimer = null;
var simTimerDelay = 4000; // Delay in ms
/**
 * Starts the simulation timer. Every interval, a new random record is added
 */
var startSimTimer = function() {
  if (simTimer == null) {
    console.info("Simulation timer started");
    simTimer = setInterval(function () {
        // Create (quite) random event
        var temperatureRnd = Math.random() - 0.5;
        var humidityRnd = Math.random() - 0.5;
        var rainRnd = Math.random();
        var windRnd = Math.random();

        var temp = Math.round((currentRecord.temperature + (temperatureRnd / 3)) * 10) / 10;
        var humidity = Math.round(currentRecord.humidity + (humidityRnd * 2));
        var rain = currentRecord.rain + Math.round(rainRnd *.8);
        var wind = 0.0;
        if (windRnd > 0.7) {
          wind = Math.round(windRnd * 15) / 10;
        }
        var recString = '$1;1;;;;;;;;;;;;;;;;;;' + temp.toString().replace(/[.]/g,',') + ';' + humidity.toString() + ';' + wind.toString().replace(/[.]/g,',') + ';' + rain.toString() + ';0;0';
        addNewRecord(recString);
      },
      simTimerDelay);
  }
}
/**
 * Stops the simulation timer
 */
var stopSimTimer = function() {
  if (simTimer != null) {
    console.info("Simulation timer stopped");
    clearInterval(simTimer);
  }
  simTimer = null;
}