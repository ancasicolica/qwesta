/**
 * Simulator for the weather station. Quite simple, just providing fast data.
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

  var currentRecord  = weather.getLastRecord();

  var temp = Math.round(_.random(currentRecord.temperature - 0.3, currentRecord.temperature + 0.3) * 10) / 10;
  var humidity = _.random(Math.max(currentRecord.humidity - 2, 30), Math.min(currentRecord.humidity + 2, 100));
  var rain = currentRecord.rain + _.random(0,2, false);
  var wind = _.random(0,30, false);
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
    weather.enableStorage(false);
  },
  stop : function () {
    simulatorActive = false;
    weather.enableStorage(true);
  }
};
