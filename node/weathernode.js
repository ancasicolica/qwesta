/***********************************************************************************/
/**
 * Created by Christian on 22.09.2014.
 */
/***********************************************************************************/

var weather = require('./weatherrecord.js');

// Configure the comport as required by your system
var serialComPort = 'COM4';         // Windows
var serialComPort = '/dev/ttyUSB0'  // Linux
var simulator = true; // set to true when simulating
var port = 8888; // set to your port
/***********************************************************************************/


var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var express = require('express');
var mime = require('mime');

var app = express();

/**
 * Get the file /ajax/current.html
 * This file contains the current records and is generated
 */
app.get('/ajax/current.html', function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(weather.getAllRecords());
});

/**
 * Get every other file (available on the filesystem)
 */
app.get('*', function(request, response) {

  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd() + '/html', uri);

  fs.exists(filename, function (exists) {
    if (!exists) {
      // File does not exist. Generated files were handled before.
      response.writeHead(404, {'Content-Type': 'text/plain'});
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

http.createServer(app).listen(port);

console.log('Weather server is running at http://localhost:' + port + '/\nCTRL + C to shutdown');


/***********************************************************************************/
// Serial port handling
/***********************************************************************************/
var serialport = require('./node_modules/serialport/serialport.js');
var SerialPort = serialport.SerialPort; // localize object constructor

if (simulator) {
  weather.startSimulator();
}


var sp = new SerialPort(serialComPort, {
  baudrate: 9600,
  parser  : serialport.parsers.readline('\n')
}, false); // this is the openImmediately flag [default is true]

/**
 * Open the serial port
 */
sp.open(function () {
  console.log('Serialport opened');

  // this is just a test record
  var we3 = weather.newRecord('$1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0');
  console.log("E:" + we3.toString());

  // handles the incoming data, creates a new weather record
  sp.on('data', function (data) {
    var r = weather.newRecord(data);
    if (r != null) {
      console.log('data received: ' + r.toString());
    }

  });

});