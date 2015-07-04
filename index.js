'use strict';

const connect = require('./lib/connect');
const Server = require('./lib/server');
const Socket = require('./lib/socket');
const isIp = require('is-ip');

module.exports.Server = Server;
module.exports.createServer = function (cb) {
  return new Server(cb);
}

module.exports.Socket = Socket;
module.exports.createConnection = connect;

module.exports.connect = connect;
module.exports.isIP = isIp;
module.exports.isIPv4 = isIp.v4;
module.exports.isIPv6 = isIp.v6;
