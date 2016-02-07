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
  logger.info(data);
});

app.listen(settings.localServerPort)
logger.info('Qwesta started up on port ' + settings.localServerPort);
