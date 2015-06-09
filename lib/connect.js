'use strict';

const Socket = require('./socket');
const runtimejs = require('runtimejs');
const TCPSocket = runtimejs.net.TCPSocket;

module.exports = function (port) {
  const tcpSocket = new TCPSocket();
  tcpSocket.open('127.0.0.1', port);
  return new Socket(tcpSocket);
}
