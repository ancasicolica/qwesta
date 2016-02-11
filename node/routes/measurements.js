/**
 * The measuremets route
 * Created by kc on 07.02.16.
 */


var express = require('express');
var router  = express.Router();
var weather = require('../lib/weatherrecord');
/**
 * Get the file /ajax/current.html
 * This file contains the current records and is generated
 */
router.get('/current', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getCurrentRecordAsJson());
});


router.get('/all', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getAllRecordsAsJson());
});


/**
 * Get the file /ajax/temperature.html
 * This file contains the available temperature data and is generated
 */
router.get('/temperature', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getTemperatureDataAsJson());
});

/**
 * Get the file /ajax/humidity.html
 * This file contains the available temperature data and is generated
 */
router.get('/humidity', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getHumidityDataAsJson());
});

module.exports = router;
