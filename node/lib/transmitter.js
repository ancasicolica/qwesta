/***********************************************************************************/
/*
 File:    transmitter.js
 Purpose: Transmits the weather data to the webserver
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 2.4.15
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

var settings           = require('./../settings');
var logger             = require('./logger').getLogger('lib:transmitter');
var needle             = require('needle');
var crypto             = require('crypto');
var _                  = require('lodash');
var records            = [];
var retryInterval;
var requestPending     = false;
/**
 * Callback after pushing a record to the webserver
 * @param err if not null, data was not pushed
 * @param rec record
 */
var pushRecordCallback = function (err, rec) {
  if (err) {
    rec.pushError = true;
    logger.info('Transmit error: ' + err.message + ' ' + rec.timestamp);
    return;
  }

  _.pull(records, rec);
  if (records.length > 0) {
    logger.info('Records length: ' + records.length);
  }
};

/**
 * Adds a record to the transmit queue
 * @param rec
 */
var addToQueue = function (rec) {
  if (records.length > 0) {
    rec.delay = records.length;
  }
  records.push(rec);

  if (!retryInterval) {
    logger.info('Start retry timer');
    retryInterval = setInterval(function () {
      if (records.length > 0) {
        pushRecord(records[0], pushRecordCallback);
      }
    }, settings.transmissionPollTime);
  }

};
/**
 * Sends data to your webserver.
 * A GET request is used as some webservers (like mine...) refuse POST requests
 * due to security reasons.
 * @param record
 * @param callback
 */
var pushRecord = function (record, callback) {

  if (requestPending) {
    // Request is pending, don't send another one
    return callback(new Error('req pending'), record);
  }

  var weatherData = new Buffer(JSON.stringify(record)).toString('base64');
  var shasum      = crypto.createHash('sha1');
  var hashVal     = settings.communicationHashSeed + weatherData;
  shasum.update(hashVal);
  var signature = shasum.digest('hex');
  var query     = "?q=" + weatherData + "&h=" + signature;
  var url       = settings.webserver.protocol + settings.webserver.hostname + ':' + settings.webserver.port + settings.webserver.url + query;

  logger.info('-> ' + record.timestamp);
  requestPending = true;
  needle.get(url, function (error, response) {
    if (!error && response.statusCode !== 200) {
      callback(new Error('Invalid status code: ' + response.statusCode));
    }
    else {
      callback(error, record);
    }
    requestPending = false;
  });
};

module.exports = {
  addToQueue: addToQueue
};
