'use strict';

const Socket = require('./socket');
const runtimejs = require('runtimejs');
const TCPSocket = runtimejs.net.TCPSocket;
const dns = runtimejs.dns;
const isIp = require('is-ip');

module.exports = function () {
  let port;
  let host;

  const args = arguments;
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

  if (host === 'localhost') {
    host = '127.0.0.1'
  }

  if (isIp(host)) {
    inner.open(host, port);
  } else {
    // TODO: use a node-compatible dns-module?
    dns.resolve(host, {}, function (err, data) {
      if (err) {
        return socket.emit('error', err);
      }

      const aRecords = data.results.filter(function (row) {
        return row.record === 'A';
      });
      const ip = aRecords[Math.floor(aRecords.length * Math.random())]
        .address.join('.')

      inner.open(ip, port);
    });
  }

  return socket;
}
