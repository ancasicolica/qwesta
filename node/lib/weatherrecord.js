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

var transmitter = require('./transmitter');
var _           = require('lodash');
var logger      = require('./logger').getLogger('lib:weatherrecord');

var storageEnabled = true;

// Format: $1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0
module.exports = {
  /**
   * Creates a new record
   * @param record as read from the serial interface
   * @returns {*}
   */
  newRecord: function (record) {
    return addNewRecord(record);
  },

  /**
   * Get the last record
   * @returns {*}
   */
  getLastRecord           : function () {
    if (measurementList.length === 0) {
      return {
        temperature: 20.0,
        humidity   : 90,
        rain       : 1000
      };
    }
    return _.last(measurementList);
  },
  /**
   * Returns the most recent record as JSON string
   * @returns {*}
   */
  getCurrentRecordAsJson  : function () {
    if (measurementList.length > 0) {
      return JSON.stringify(measurementList[measurementList.length - 1]);
    }
    return JSON.stringify(null);
  },
  /**
   * Returns the newest records (maxNbOfMeasurementsForCurrent)
   * @returns {*}
   */
  getNewestRecords        : function () {
    if (measurementList.length > maxNbOfMeasurementsForCurrent) {
      return JSON.stringify(measurementList.slice(measurementList.length - maxNbOfMeasurementsForCurrent));
    }
    return JSON.stringify(measurementList);
  },
  /**
   * Returns the records for the temperature chart
   * @returns {*}
   */
  getTemperatureDataAsJson: function () {
    var data = [];
    for (var i = 0; i < measurementList.length; i++) {
      data.push({'timestamp': measurementList[i].timestamp, 'temperature': measurementList[i].temperature});
    }
    return JSON.stringify(data);
  },
  /**
   * Returns the records for the humidity chart
   * @returns {*}
   */
  getHumidityDataAsJson   : function () {
    var data = [];
    for (var i = 0; i < measurementList.length; i++) {
      data.push({'timestamp': measurementList[i].timestamp, 'humidity': measurementList[i].humidity});
    }
    return JSON.stringify(data);
  },
  /**
   * Returns all records as JSON string
   * @returns {*}
   */
  getAllRecordsAsJson     : function () {
    return JSON.stringify(measurementList);
  },
  /**
   * Enable / Disable storage in the webserver
   * @param enabled
   */
  enableStorage : function(enabled) {
    storageEnabled = enabled;
  }
};

var measurementList = [];  // List with the measurementList
var maxNbOfMeasurements = 100;    // Max number of measurementList in the list
var maxNbOfMeasurementsForCurrent = 10; // max number for current list

/***********************************************************************************/
/**
 * Adds a new record to the measurement list
 * @param record as read from the serial interface
 * @returns {*} the new WeatherRecord
 */
var addNewRecord = function (record) {
  try {
    var rec = record.toString();
    var wr  = new WeatherRecord(rec);

    // Validate -  from time to time the weather station sends invalid records
    if (wr.humidity === 0 && wr.temperature === 0 && wr.wind === 0) {
      logger.info('Invalid record detected, dumping it');
      return null;
    }

    if (measurementList.length > 0) {
      if (wr.rain >= measurementList[measurementList.length - 1].rain) {
        wr.rainDifference = (wr.rain - measurementList[measurementList.length - 1].rain);
      }
      else {
        // overflow!
        wr.rainDifference = 4096 - measurementList[measurementList.length - 1].rain + wr.rain;
      }
    }
    else {
      wr.rainDifference = 0;
    }

    // our measurementList list has max maxNbOfMeasurements entries
    measurementList.push(wr);
    if (measurementList.length > maxNbOfMeasurements) {
      measurementList.shift();
    }

    if (!storageEnabled) {
      wr.simulation = true;
      logger.info('Simulation only!!');
    }
    transmitter.addToQueue(wr);
    return wr;
  }
  catch (e) {
    logger.error("newRecord exception: " + e);
    return null;
  }
};


/***********************************************************************************/
/**
 * Class for one single record
 * @param record as read from the serial interface
 * @constructor
 */
var WeatherRecord = function (record) {
  var elements = record.split(";");
  if ((elements[0] != "$1") || (elements.length != 25)) {
    throw "Malformed record:" + record;
  }
  this.timestamp   = new Date();
  this.temperature = parseFloat(elements[19].replace(/[,]/g, '.'));
  this.humidity    = parseInt(elements[20]);
  this.wind        = parseFloat(elements[21].replace(/[,]/g, '.'));
  this.rain        = parseInt(elements[22]);  // 1 tick is approx 295 ml/m2
  this.isRaining      = (elements[23] == "1");
  this.rainDifference = 0; // Difference since the last measurement, ticks

};

/**
 * toString override
 * @returns {string}
 */
WeatherRecord.prototype.toString = function () {
  return this.timestamp + " T:" + this.temperature + " H:" + this.humidity + "% W:"
    + this.wind + " R:" + this.rain + " iR:" + this.isRaining;
};
