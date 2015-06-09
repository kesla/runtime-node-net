'use strict';

const test = require('tape');
// right now we get browser === true when in runtimejs
const net = process.browser ? require('../') : require('net');

test('createServer listen to port', function (t) {
  const server = net.createServer();

  server.listen(9999, function () {
    const address = server.address();
    t.equal(address.port, 9999, 'correct port');
    t.equal(address.address, '::', 'correct address');
    t.equal(address.family, 'IPv6', 'correct family');
    server.close();
    t.end();
  });
});

test('createServer() listen to port & address', function (t) {
  const server = net.createServer();

  server.listen(9999, '127.0.0.1', function () {
    const address = server.address();
    t.equal(address.port, 9999, 'correct port');
    t.equal(address.address, '127.0.0.1', 'correct address');
    t.equal(address.family, 'IPv4', 'correct family');
    server.close();
    t.end();
  });
});

test('createServer() listen to port 0', function (t) {
  const server = net.createServer();

  server.listen(0, '127.0.0.1', function () {
    const address = server.address();
    t.ok(address.port > 0, 'correct port');
    t.equal(address.address, '127.0.0.1', 'correct address');
    t.equal(address.family, 'IPv4', 'correct family');
    server.close();
    t.end();
  });
});

test('createServer() subscribe to events', function (t) {
  const server = net.createServer();
  let async = 0;
  server.listen(0);
  server.once('listening', function () {
    server.close();
    server.once('close', function () {
      t.equal(async, 2, 'events are async');
      t.end();
    });
    async++;
  });
  async++;
});

test('createServer() listen, close, listen and close', function (t) {
  const server = net.createServer();
  let async = 0;
  server.listen(0, function () {
    t.ok(server.address().port > 0, 'correct port');
    server.close(function () {
      t.equal(server.address(), null, 'address() null');
      server.listen(0, function () {
        t.ok(server.address().port > 0, 'correct port');
        server.close(function () {
          t.equal(async, 4, 'close & listen are async');
          t.equal(server.address(), null, 'address() null');
          t.end();
        });
        async++;
      });
      async++
    });
    async++;
  });
  async++;
});

test('createConnection && connect', function (t) {
  t.equal(net.createConnection, net.connect, 'createConnection & connect are the same');
  t.end();
});

test('createServer() & createConnection()', function (t) {
  const server = net.createServer();

  server.once('connection', function (serverSocket) {
    serverSocket.once('data', function (chunk) {
      t.equal(chunk.toString(), 'beep');
    });
    serverSocket.write('boop');
    serverSocket.end();
  });

  server.listen(0, function () {
    const clientSocket = net.createConnection(server.address().port);
    clientSocket.write('beep');
    clientSocket.once('data', function (chunk) {
      t.equal(chunk.toString(), 'boop');
      server.close(function () {
        t.end();
      });
    });
  });
});
