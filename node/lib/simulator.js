/**
 *
 * Created by kc on 07.02.16.
 */

var _                 = require('lodash');
var weather           = require('./weatherrecord');
var simulatorActive   = false;
var socket            = require('./socket');
/**
 * Create a random Event
 * @returns {string} Random Event
 */
var createRandomEvent = function () {
// Create (quite) random event
  var temperatureRnd = Math.random() - 0.5;
  var humidityRnd    = Math.random() - 0.5;
  var rainRnd        = Math.random();
  var windRnd        = Math.random();
  var currentRecord  = weather.getLastRecord();

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
  weather.newRecord('$1;1;;;;;;;;;;;;;;;;;;' + temp.toString().replace(/[.]/g, ',') + ';' + humidity.toString() + ';' + wind.toString().replace(/[.]/g, ',') + ';' + rain.toString() + ';0;0');
  var s = socket.get();
  if (s) {
    s.emit('weatherdata', weather.getLastRecord());
  }

  if (simulatorActive) {
    _.delay(createRandomEvent, 5000);
  }
};


module.exports = {
  start: function () {
    simulatorActive = true;
    _.delay(createRandomEvent, 1000);
  },
  stop : function () {
    simulatorActive = false;
  }
};
