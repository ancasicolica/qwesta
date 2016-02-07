/**
 * The qwesta main file
 * Created by kc on 07.02.16.
 */

var logger       = require('./lib/logger').getLogger('server');
var usbConnector = require('./lib/usbConnector');
var express      = require('express');
var mime         = require('mime');
var settings     = require('./settings');
var bodyParser   = require('body-parser');
var compression  = require('compression');
var path         = require('path');
var weather      = require('./lib/weatherrecord.js');
var simulator    = require('./lib/simulator');

var app = express();
app.use(require('./lib/expressLogger'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(compression());
app.use('/', require('./routes/index'));
app.use('/measurements', require('./routes/measurements'));

usbConnector.on('data', data => {
  var r = weather.newRecord(data);
  if (r != null) {
    logger.info('data received: ' + r.toString());
  }
});

app.listen(settings.localServerPort);
logger.info('Qwesta started up on port ' + settings.localServerPort);

if (settings.simulator) {
  logger.info('Simulator is ACTIVE');
  simulator.start();
}
