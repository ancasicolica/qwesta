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
  newRecord             : function (record) {
    return addNewRecord(record);
  },
  /**
   * Returns the most recent record as JSON string
   * @returns {*}
   */
  getCurrentRecordAsJson: function () {
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
  getAllRecordsAsJson   : function () {
    return JSON.stringify(measurementList);
  },
  /**
   * Starts the simulator
   */
  startSimulator        : function () {
    startSimTimer();
  },
  /**
   * Stopps the simulator
   */
  stopSimulator         : function () {
    stopSimTimer();
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
    var wr = new WeatherRecord(rec);

    if (measurementList.length > 0) {
      wr.rainDifference = (wr.rain - measurementList[measurementList.length - 1].rain);
    }
    else {
      wr.rainDifference = 0;
    }

    // our measurementList list has max maxNbOfMeasurements entries
    measurementList.push(wr);
    if (measurementList.length > maxNbOfMeasurements) {
      measurementList.shift();
    }
    sendDataToServer(wr);
    return wr;
  }
  catch (e) {
    console.error("newRecord exception: " + e);
    return null;
  }
}


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
  this.timestamp = new Date();
  this.temperature = parseFloat(elements[19].replace(/[,]/g, '.'));
  this.humidity = parseInt(elements[20]);
  this.wind = parseFloat(elements[21].replace(/[,]/g, '.'));
  this.rain = parseInt(elements[22]);  // 1 tick is approx 295 ml/m2
  this.isRaining = (elements[23] == "1");
  this.rainDifference = 0; // Difference since the last measurement, ticks

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


var http = require('http');
var config = require('./configuration.js');
var crypto = require('crypto');

/**
 * Sends data to your webserver.
 * A GET request is used as some webservers (like mine...) refuse POST requests
 * due to security reasons.
 * @param record
 */
var sendDataToServer = function (record) {

  // If the simulation is running, set the sim flag to true
  if (simTimer != null) {
    record.simulation = true;
  }

  var weatherData = new Buffer(JSON.stringify(record)).toString('base64');
  var shasum = crypto.createHash('sha1');
  var hashVal = config.communicationHashSeed + weatherData;
  console.log(hashVal);
  shasum.update(hashVal);
  var signature = shasum.digest('hex');

  var query = "?q=" + weatherData + "&h=" + signature;

  var options = {
    hostname: config.webserverHostname,
    port    : 80,
    path    : config.webserverUrl + query,
    method  : 'GET'
  };

  var req = http.request(options, function (res) {

    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      if (simTimer != null) {
        // Do not spam the log on the weather station, show only in sim
        console.log('RESULT: ' + chunk);
      }
      // console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });


  // Transfer request
  req.end();

};


/***********************************************************************************/
/* Simulation part, not needed for productive system                               */
var simTimer = null;
var simTimerDelay = 5000; // Delay in ms
/**
 * Starts the simulation timer. Every interval, a new random record is added
 */
var startSimTimer = function () {
  if (simTimer == null) {
    console.info("Simulation timer started");
    simTimer = setInterval(function () {
        addNewRecord(createRandomEvent());
      },
      simTimerDelay);
  }
};
/**
 * Stops the simulation timer
 */
var stopSimTimer = function () {
  if (simTimer != null) {
    console.info("Simulation timer stopped");
    clearInterval(simTimer);
  }
  simTimer = null;
};
/**
 * Create a random Event
 * @returns {string} Random Event
 */
var createRandomEvent = function () {
// Create (quite) random event
  var temperatureRnd = Math.random() - 0.5;
  var humidityRnd = Math.random() - 0.5;
  var rainRnd = Math.random();
  var windRnd = Math.random();
  var currentRecord;
  if (measurementList.length > 0) {
    currentRecord = measurementList[measurementList.length - 1];
  }
  else {
    currentRecord = {
      temperature: 20.0,
      humidity   : 90,
      rain       : 1000
    };
  }
  var temp = Math.round((currentRecord.temperature + (temperatureRnd / 3)) * 10) / 10;
  if (temp < -10) {
    temp = -10;
  } else if (temp > 45) {
    temp = 45;
  }
  var humidity = Math.round(currentRecord.humidity + (humidityRnd * 2));
  if (humidity < 30) {
    humidity = 30;
  } else if (humidity > 99) {
    humidity = 99;
  }
  var rain = currentRecord.rain + Math.round(rainRnd * .8);
  var wind = 0.0;
  if (windRnd > 0.7) {
    wind = Math.round(windRnd * 15) / 10;
  }
  var recString = '$1;1;;;;;;;;;;;;;;;;;;' + temp.toString().replace(/[.]/g, ',') + ';' + humidity.toString() + ';' + wind.toString().replace(/[.]/g, ',') + ';' + rain.toString() + ';0;0';
  return recString;
};
