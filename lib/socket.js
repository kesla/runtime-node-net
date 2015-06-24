'use strict';

const Duplex = require('stream').Duplex;

class Socket extends Duplex {
  constructor (socket) {
    super()
    this._socket = socket
    this._buffer = [];
    const self = this;
    this._socket.onopen = function () {
      if (self._buffer.length) {
        const buffer = Buffer.concat(self._buffer);
        self._buffer.length = 0;
        self._socket.send(buffer);
      }
      self.emit('connect');
    };

    this._socket.ondata = function (chunk) {
      self.push(new Buffer(chunk));
    };

    this._socket.onend = function () {
      self.push(null);
      self.writable = false;
      self.readable = false;
    };
  }

  _write (chunk) {
    if (!Buffer.isBuffer(chunk)) {
      chunk - new Buffer(chunk);
    }

    // this is probably not correct..
    if (this._socket.readyState !== 'open') {
      this._buffer.push(chunk);
    } else {
      this._socket.send(chunk)
    }
  }

  _read (num) {}

  setTimeout () {}

  destroySoon () {
    this.writable = false;
    this.readable = false;
  }

  destroy() {
    this._socket.close();
    this.writable = false;
    this.readable = false;
  }
}

module.exports = Socket;
