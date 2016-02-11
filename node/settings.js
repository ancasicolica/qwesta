/**
 * Settings file, reads the settings from the specific folder. Thanks Adriano for this file :-)
 * Created by kc on 02.04.15.
 */

var pkg = require('./package.json');
var fs = require('fs');
var path = require('path');

var settings = {
    name: pkg.name,
    version: pkg.version,
    debug: (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false
};

process.env.DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'local';


// Some of the settings can be set by environment variables, you can override them in the settings file
settings.communicationHashSeed = process.env.QWESTA_HASH_SEED || 'none';
settings.webserver = {
    hostname: process.env.QWESTA_HOSTNAME || 'example.com',
    protocol: process.env.QWESTA_PROTOCOL || 'http://',
    port: process.env.QWESTA_PORT || 80,
    url: process.env.QWESTA_URL || '/qwesta/push.php'
};

settings.localServerPort = process.env.QWESTA_LOCAL_PORT || 8080;
settings.htmlRootPath = process.env.QWESTA_HTML_ROOT_PATH || path.join(__dirname, 'html');
settings.serialComPort = process.env.QWESTA_SERIALPORT || '/dev/ttyUSB0';

settings.transmissionPollTime = 15000;

settings.logger = {
    level: 'debug'
};

settings.simulator = process.env.SIMULATOR || false;

if (process.env.DEPLOY_TYPE && fs.existsSync(path.join(__dirname, 'settings/' + process.env.DEPLOY_TYPE + '.js'))) {
    module.exports = require('./settings/' + process.env.DEPLOY_TYPE + '.js')(settings);
} else {
    module.exports = settings;
}
