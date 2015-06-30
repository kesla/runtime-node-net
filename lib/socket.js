'use strict';

const Duplex = require('stream').Duplex;

class Socket extends Duplex {
  constructor (socket) {
    super()
    this._socket = socket
    this._buffer = [];
    this._socket.onopen = () => {
      if (this._buffer.length) {
        const buffer = Buffer.concat(this._buffer);
        this._buffer.length = 0;
        this._socket.send(buffer);
      }
      this.emit('connect');
    };

    this._socket.ondata = (chunk) => {
      this.push(new Buffer(chunk));
    };

    this._socket.onend = () => {
      this.push(null);
      this.destroySoon();
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
