'use strict';

const connect = require('./lib/connect');
const Server = require('./lib/server');

module.exports.createServer = function (cb) {
  return new Server(cb);
}

module.exports.createConnection = connect;

module.exports.connect = connect;
