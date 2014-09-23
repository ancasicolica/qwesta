/**
 * Created by Christian on 22.09.2014.
 */

var weather = require("./weatherrecord.js");

var serialComPort = "COM4";
var serialComPort = "/dev/ttyUSB0"

var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var port = process.argv[2] || 8888;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd() + '/html', uri);
  var jsPattern = /.js/;
  var getCurrentRecordPattern = /ajax\/current.html/;




  fs.exists(filename, function(exists) {
    if(!exists) {
      if (getCurrentRecordPattern.test(uri)) {
        response.writeHead(200);
        response.write(weather.getCurrentRecord());
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

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
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

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

var server = http.createServer(function(req, res) {
  console.log(req);
  console.log(req);
  res.writeHead(200);
  res.write('<!DOCTYPE html><html><head>');
  res.write('<meta charset="UTF-8">');
  res.write('<meta http-equiv="refresh" content="60" >');
  res.write('</head><body>');
  res.write('</body></html>');
  res.write(weather.getCurrentRecord());
  res.end();
});
server.listen(8081);




var SerialPort = require("./node_modules/serialport/serialport.js").SerialPort
var serialPort = new SerialPort(serialComPort, {
  baudrate: 9600
}, false); // this is the openImmediately flag [default is true]

serialPort.open(function () {
  console.log('open');

  var we3 = weather.newRecord("$1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0");
  console.log("E:" + we3.toString());
  serialPort.on('data', function(data) {
    var r = weather.newRecord(data);
    if (r != null) {
      console.log('data received: ' + r.toString());
    }

  });

});