/**
 * Created by Christian on 22.09.2014.
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