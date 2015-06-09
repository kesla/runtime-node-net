'use strict';

const connect = require('./lib/connect');
const Server = require('./lib/server');
const Socket = require('./lib/socket');

module.exports.Server = Server;
module.exports.createServer = function (cb) {
  return new Server(cb);
}

module.exports.Socket = Socket;
module.exports.createConnection = connect;

module.exports.connect = connect;
