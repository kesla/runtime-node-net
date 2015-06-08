'use strict';

var Server = require('./lib/server');

module.exports.createServer = function () {
  return new Server();
}
