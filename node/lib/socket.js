/**
 *
 * Created by kc on 07.02.16.
 */
var logger = require('./logger').getLogger('lib:socket');
var socket;

module.exports = {};

function QwestaSocket(server) {
  var self = this;
  this.io  = require('socket.io')(server);

  this.socket = null;

  this.io.on('connect', function (socket) {
    logger.info('io connect event');
    self.socket = socket;
  });
  this.io.on('connection', function (socket) {
    logger.info('io connection event');
  });
  this.io.on('connect_error', function (obj) {
    logger.info('io connect_error event');
    logger.info(obj);
  });
  this.io.on('connect_timeout', function (socket) {
    logger.info('io connect_timeout event');
  });
  this.io.on('reconnect', function (socket) {
    logger.info('io reconnect event');
  });
  this.io.on('reconnect_attempt', function (socket) {
    logger.info('io reconnect_attempt event');
  });
  this.io.on('reconnecting', function (socket) {
    logger.info('io reconnecting event');
  });
  this.io.on('reconnect_error', function (socket) {
    logger.info('io reconnect_error event');
  });
  this.io.on('reconnect_failed', function (socket) {
    logger.info('io reconnect_failed event');
  });
}

QwestaSocket.prototype.emit = function(channel, data) {
  if (this.socket) {
    this.socket.emit(channel, data);
  }
}


module.exports = {
  create: function (server) {
    socket = new QwestaSocket(server);
    logger.info('Socket.io instance created');
    return socket;
  },

  get: function () {
    return socket;
  }
};
