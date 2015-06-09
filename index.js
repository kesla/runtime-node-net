'use strict';

var connect = require('./lib/connect');
var Server = require('./lib/server');

module.exports.createServer = function () {
  return new Server();
}

module.exports.createConnection = connect;

module.exports.connect = connect;
