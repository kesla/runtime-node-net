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
    };
  }

  _write (chunk, enc, cb) {
    if (!Buffer.isBuffer(chunk)) {
      chunk - new Buffer(chunk);
    }

    // this is probably not correct..
    if (this._socket.readyState !== 'open') {
      this._buffer.push(chunk);
    } else {
      this._socket.send(chunk)
    }
    cb();
  }

  _read (num) {}

  setTimeout () {}

  destroySoon () {
    this.end();
  }

  destroy() {
    if (this._socket.readyState === 'connecting') {
      this.once('connect', this.destroy);
    } else if (this._socket.readyState === 'open') {
      this._socket.close();
      this.writable = false;
      this.readable = false;
    }
  }

  end(data, encoding) {
    Duplex.prototype.end.call(this, data, encoding);
    this.writable = false;

    this.once('finish', this.destroy);
  }
}

module.exports = Socket;
