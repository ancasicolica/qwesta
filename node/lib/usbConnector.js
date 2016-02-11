/**
 * Connects to the USB Module of the weather station
 * Created by kc on 7.2.16
 */

var util          = require('util');
var serialPortLib = require('serialport');
var SerialPort    = require('serialport').SerialPort;
var usbDetect     = require('usb-detection');
var EventEmitter  = require('events').EventEmitter;
var _             = require('lodash');
var logger        = require('./logger').getLogger('lib:usbConnector');

/**
 * Constructor
 * @constructor
 */
function UsbConnector() {
  EventEmitter.call(this);
  var self = this;

  usbDetect.on('add:4292:60000',  device => {
    logger.debug('ELV receiver found in UsbConnector', device);
    _.delay(self.connectToDevice.bind(self), 700);
    self.emit('usbConnected');
  });

  self.connectToDevice(err => {
    if (err) {
      logger.error(err);
    }
  });
}

// Event-Emitter adding to UsbConnector
util.inherits(UsbConnector, EventEmitter);

/**
 * Scans the ports for an USB dongle
 * @param callback
 */
UsbConnector.prototype.scanPorts = function (callback) {
  var usbPort;
  if (!serialPortLib.list) {
    return callback(new Error('Serialport not available'));
  }
  serialPortLib.list(function (err, ports) {
    if (err) {
      return callback(err);
    }

    ports.forEach(function (port) {
      if (port.productId === '0xea60' && port.vendorId === '0x10c4') {
        // This is for modern systems like Mac or Linux
        logger.debug('ELV receiver found @ ' + port.comName);
        usbPort = port;
      }
      else if (port.pnpId && port.pnpId.toLowerCase().indexOf('vid_10c4') > 0 && port.pnpId.toLowerCase().indexOf('pid_ea60') > 0) {
        // This is Windows legacy support
        logger.debug('ELV receiver found @ ' + port.comName);
        usbPort = port;
      }
    });
    callback(null, usbPort);
  });
};

/**
 * Returns the current serial port
 * @returns {*}
 */
UsbConnector.prototype.getCurrentSerialPort = function () {
  return this.usedSerialPort;
};

/**
 * Connect to the USB Dongle
 * @param callback
 */
UsbConnector.prototype.connectToDevice = function (callback) {
  try {
    var comName;
    var self = this;

    self.scanPorts(function (err, port) {
      if (err) {
        logger.error(err);
        return;
      }

      if (!port) {
        logger.info('No USB Dongle found');
        return;
      }

      comName             = port.comName;
      self.usedSerialPort = port;
      logger.debug('Serialport autoscan, using ' + comName);

      self.serialPort = new SerialPort(comName,
        {
          baudrate: 9600,
          parser  : serialPortLib.parsers.readline('\n')
        });

      self.serialPort.on('data', function (data) {
        self.emit('data', data);
      });

      self.serialPort.on('close', function () {
        logger.debug('SERIALPORT CLOSED!');
        self.usedSerialPort = undefined;
        self.emit('close');
      });

      self.serialPort.on('error', function (err) {
        logger.error('SERIALPORT ERROR!', err.message);
        self.usedSerialPort = undefined;
        self.emit('error', err);
        logger.debug('We try to reconnect to the serialport asap');
        _.delay(self.connectToDevice.bind(self), 1000);
      });

      self.serialPort.on('open', function (erSchr) {
        logger.debug('SERIALPORT (RE)OPENED');
        self.emit('open');
      });
    });
  }
  catch (e) {
    console.error(e);
    if (callback) {
      callback(e);
    }
  }
};


/**
 * Returns true when connected to the dongle
 * @returns {*|SerialPort}
 */
UsbConnector.prototype.isConnected = function () {
  return (this.serialPort && this.serialPort.isOpen());
};

var usbConnector = new UsbConnector();

module.exports = usbConnector;
