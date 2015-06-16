'use strict';

const runtimejs = require('runtimejs');
const TCPServerSocket = runtimejs.net.TCPServerSocket;
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const Socket = require('./socket');

class Server extends EventEmitter {

  constructor(opts, cb) {
    super();

    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
      this.on('connection', cb);
    } else {
      opts = opts || {};

      if (typeof cb === 'function') {
        this.on('connection', cb);
      }
    }

    this._server = new TCPServerSocket();
    this._address = null;
    const self = this;
    this._server.onlisten = function () {
      process.nextTick(function () {
        self.emit('listening');
      });
    };
    this._server.onclose = function () {
      process.nextTick(function () {
        self.emit('close');
      });
    };
    this._server.onconnect = function (tcpSocket) {
      const socket = new Socket(tcpSocket);
      self.emit('connection', socket);
    };
  }

  listen (port, address, cb) {
    let family = 'IPv4';
    if (!cb) {
      cb = address;
      address = '::';
      family = 'IPv6';
    }
    this._server.listen(port);

    this._address = {
      port: this._server.localPort,
      address: address,
      family: family
    }

    if (cb) {
      this.once('listening', cb);
    }
  }

  close (cb) {
    this._address = null;
    this._server.close();
    if (cb) {
      this.once('close', cb);
    }
  }

  address () {
    return this._address;
  }
}

module.exports = Server;
