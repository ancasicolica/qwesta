/**
 * The measuremets route
 * Created by kc on 07.02.16.
 */


var express = require('express');
var router  = express.Router();
/**
 * Get the file /ajax/current.html
 * This file contains the current records and is generated
 */
router.get('/current.html', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getNewestRecords());
});

/**
 * Get the file /ajax/temperature.html
 * This file contains the available temperature data and is generated
 */
router.get('/temperature.html', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getTemperatureDataAsJson());
});

/**
 * Get the file /ajax/humidity.html
 * This file contains the available temperature data and is generated
 */
router.get('/humidity.html', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getHumidityDataAsJson());
});

module.exports = router;
