'use strict';

const Socket = require('./socket');
const runtimejs = require('runtimejs');
const TCPSocket = runtimejs.net.TCPSocket;

module.exports = function () {
  let port;
  let host;

  const args = arguments;
  if (args[0] && typeof args[0] === 'object') {
    port = args[0].port;
    host = args[0].host;
  } else {
    port = args[0];
    if (typeof args[1] === 'string') {
      host = args[1];
    }
  }
  host = host || 'localhost';

  // maybe localhost should be allowed in runtimejs?
  if (host === 'localhost') {
    host = '127.0.0.1'
  }
  const lastArg = args[args.length - 1];

  const socket = new Socket(openSocket(host, port));
  if (typeof lastArg === 'function') {
    socket.once('connect', lastArg);
  }

  return socket;
}

function openSocket (host, port) {
  const tcpSocket = new TCPSocket();
  tcpSocket.open(host, port);
  return tcpSocket;
}
