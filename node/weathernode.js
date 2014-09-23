/***********************************************************************************/
/**
 * Created by Christian on 22.09.2014.
 */
/***********************************************************************************/

var weather = require("./weatherrecord.js");

// Configure the comport as required by your system
var serialComPort = "COM4";         // Windows
var serialComPort = "/dev/ttyUSB0"  // Linux
var simulator = false; // set to true when simulating
/***********************************************************************************/
// Webserver part
var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var port = process.argv[2] || 8888;

/**
 * Webserver instance
 */
http.createServer(function (request, response) {

  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd() + '/html', uri);
  var jsPattern = /.js/;
  var getCurrentRecordPattern = /ajax\/current.html/;

  fs.exists(filename, function (exists) {
    if (!exists) {
      if (getCurrentRecordPattern.test(uri)) {
        response.writeHead(200);
        response.write(weather.getAllRecords());
        console.log("Record taken!")
      }
      else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
      }
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }

    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      if (jsPattern.test(uri)) {
        // set correct header for javascript files
        response.writeHead(200, {"Content-Type": "text/javascript"});
      }
      else {
        response.writeHead(200);
      }


      response.write(file, "binary");

      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Weather server is running at http://localhost:" + port + "/\nCTRL + C to shutdown");


/***********************************************************************************/
// Serial port handling
/***********************************************************************************/
var serialport = require("./node_modules/serialport/serialport.js");
var SerialPort = serialport.SerialPort; // localize object constructor

if (simulator) {
  weather.startSimulator();
}


var sp = new SerialPort(serialComPort, {
  baudrate: 9600,
  parser  : serialport.parsers.readline("\n")
}, false); // this is the openImmediately flag [default is true]

/**
 * Open the serial port
 */
sp.open(function () {
  console.log('Serialport opened');

  // this is just a test record
  var we3 = weather.newRecord("$1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0");
  console.log("E:" + we3.toString());

  // handles the incoming data, creates a new weather record
  sp.on('data', function (data) {
    var r = weather.newRecord(data);
    if (r != null) {
      console.log('data received: ' + r.toString());
    }

  });

});