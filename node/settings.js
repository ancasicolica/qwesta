/**
 * Settings file, reads the settings from the specific folder. Thanks Adriano for this file :-)
 * Created by kc on 02.04.15.
 */
'use strict';

var pkg = require('./package.json');
var fs = require('fs');
var path = require('path');

var settings = {
  name: pkg.name,
  version: pkg.version,
  debug: (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false
};

process.env.DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'local';

if (process.env.DEPLOY_TYPE && fs.existsSync(path.join(__dirname, 'settings/' + process.env.DEPLOY_TYPE + '.js'))) {
  module.exports = require('./settings/' + process.env.DEPLOY_TYPE + '.js')(settings);
} else {
  module.exports = settings;
}
