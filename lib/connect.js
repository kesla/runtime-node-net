'use strict';

const Socket = require('./socket');
const runtimejs = require('runtimejs');
const TCPSocket = runtimejs.net.TCPSocket;
const dns = require('dns');
const isIp = require('is-ip');

module.exports = function (...args) {
  let port;
  let host;

  if (args[0] && typeof args[0] === 'object') {
    port = Number(args[0].port);
    host = args[0].host;
  } else {
    port = Number(args[0]);
    if (typeof args[1] === 'string') {
      host = args[1];
    }
  }

  host = host || 'localhost';

  const lastArg = args[args.length - 1];
  const socket = openSocket(host, port);

  if (typeof lastArg === 'function') {
    socket.once('connect', lastArg);
  }

  return socket;
}

function openSocket (host, port) {
  const inner = new TCPSocket();
  const socket = new Socket(inner);

  _connect(inner, socket, host, port);

  return socket;
}

function _connect (inner, socket, host, port) {
  if (host === 'localhost') {
    host = '127.0.0.1'
    setImmediate(function () {
      socket.emit('lookup', null, '127.0.0.1', 4);
    });
  }

  if (isIp(host)) {
    return inner.open(host, port);
  }

  dns.lookup(host, function (err, ip) {
    if (err) {
      return socket.emit('error', err);
    }

    socket.emit('lookup', null, ip, 4);
    inner.open(ip, port);
  });
}
