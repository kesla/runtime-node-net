'use strict';

const connect = require('./lib/connect');
const Server = require('./lib/server');

module.exports.createServer = function () {
  return new Server();
}

module.exports.createConnection = connect;

module.exports.connect = connect;
