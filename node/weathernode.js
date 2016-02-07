/***********************************************************************************/
/*
 File:    weathernode.js
 Purpose: Main node file for the weather station qwesta
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

var settings = require('./settings');
if (settings.simulator) {
  console.log('QWESTA SIMULATOR ACTIVE');
}
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var weather = require('./weatherrecord.js');

var express = require('express');
var mime = require('mime');

var app = express();
/**
 * Get the file /ajax/current.html
 * This file contains the current records and is generated
 */
app.get('/ajax/current.html', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getNewestRecords());
});

/**
 * Get the file /ajax/temperature.html
 * This file contains the available temperature data and is generated
 */
app.get('/ajax/temperature.html', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getTemperatureDataAsJson());
});

/**
 * Get the file /ajax/humidity.html
 * This file contains the available temperature data and is generated
 */
app.get('/ajax/humidity.html', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getHumidityDataAsJson());
});

/**
 * Get every other file (available in the filesystem)
 */
app.get('*', function (request, response) {

  var uri = url.parse(request.url).pathname;
  var filename = path.join(settings.htmlRootPath, uri);

  fs.exists(filename, function (exists) {
    if (!exists) {
      // File does not exist. Generated files were handled before.
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write("Server root: " + settings.htmlRootPath + "\n");
      response.write("Requested file: " + filename + "\n");
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      // default for directories: index.html
      filename += '/index.html';
    }

    // Read the file and stream it (at least try to...)
    fs.readFile(filename, 'binary', function (err, file) {
      if (err) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write(err + '\n');
        response.end();
        return;
      }

      response.writeHead(200, {'Content-Type': mime.lookup(filename)});
      response.write(file, 'binary');
      response.end();
    });
  });
});

http.createServer(app).listen(settings.localServerPort);

console.log('Weather server is running at http://localhost:' + settings.localServerPort + '/\nCTRL + C to shutdown');


/***********************************************************************************/
// Serial port handling
/***********************************************************************************/
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

if (settings.simulator) {
  weather.startSimulator();
}

/**
 * Serialport object for the USB-WDE1-2
 * @type {SerialPort} Baudrate is 9600 bps, line parser is essential!
 */
var sp = new SerialPort(settings.serialComPort, {
  baudrate: 9600,
  parser  : serialport.parsers.readline('\n')
}, false); // this is the openImmediately flag [default is true]

/**
 * Open the serial port
 */
sp.open(function () {
  console.log('Serialport opened');

  // handles the incoming data, creates a new weather record
  sp.on('data', function (data) {
    var r = weather.newRecord(data);
    if (r != null) {
      console.log('data received: ' + r.toString());
    }
  });
});
