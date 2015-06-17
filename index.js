'use strict';

const connect = require('./lib/connect');
const Server = require('./lib/server');
const Socket = require('./lib/socket');
const isIp = require('is-ip');

const wrapper = new Server(function(servsocket) {
  servsocket.once('data', function(data) {
    servsocket.end();
    wrapper.close();
  });
});
wrapper.listen(0, function() {
  const initsocket = connect(wrapper.address().port);
  initsocket.write('open');
  initsocket.close();
});

module.exports.Server = Server;
module.exports.createServer = function (cb) {
  return new Server(cb);
}

module.exports.Socket = Socket;
module.exports.createConnection = connect;

module.exports.connect = connect;
module.exports.isIp = isIp;
module.exports.isIPv4 = isIp.v4;
module.exports.isIpv6 = isIp.v6;
