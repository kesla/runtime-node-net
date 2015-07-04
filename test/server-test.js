'use strict';

const test = require('tape');
const net = require('net');

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

test('createServer() with callback', function (t) {
  const server = net.createServer(function (socket) {
    socket.once('data', function (chunk) {
      t.equal(chunk.toString(), 'beep');
      socket.end();
      server.close(t.end.bind(t));
    });
  });

  server.listen(0, function () {
    const socket = net.createConnection(server.address().port);
    socket.write('beep');
    socket.end();
  });
});

// adapted from https://github.com/nodejs/io.js/blob/master/test/parallel/test-net-bind-twice.js
test('createServer() bind twice', function (t) {
  const server1 = net.createServer(t.fail.bind(t));
  server1.listen(0, function () {
    server2.listen(server1.address().port, t.fail.bind(t));
  })
  const server2 = net.createServer(t.fail.bind(t));
  server2.on('error', function (e) {
    t.equal(e.code, 'EADDRINUSE');
    server1.close();
    t.end();
  });
});

// adapted from https://github.com/nodejs/io.js/blob/master/test/parallel/test-net-server-try-ports.js
// This tests binds to one port, then attempts to start a server on that
// port. It should be EADDRINUSE but be able to then bind to another port.
test('createServer() try ports', function (t) {
  let server1listening = false;
  let server2listening = false;
  let server2eaddrinuse = false;

  const server1 = net.createServer(function(socket) {
    socket.destroy();
  });

  const server2 = net.createServer(function(socket) {
    socket.destroy();
  });

  let server2errors = 0;
  server2.on('error', function(e) {
    server2errors++;

    if (e.code == 'EADDRINUSE') {
      server2eaddrinuse = true;
    }

    server2.listen(0, function() {
      t.ok(server1listening, 'server1 listening');
      t.ok(server2eaddrinuse, 'server2 EADDRINUSE');
      t.equal(server2errors, 1, 'server2 1 error');

      server1.close();
      server2.close();
      t.end();
    });
  });


  server1.listen(0, function() {
    server1listening = true;
    // This should make server2 emit EADDRINUSE
    server2.listen(server1.address().port);
  });
});

// adapted from https://github.com/nodejs/io.js/blob/master/test/parallel/test-net-listen-close-server.js
test('createServer() listen & close in same tick', function (t) {
  var server = net.createServer(t.fail.bind(t));
  server.listen(0, t.fail.bind(t));
  server.on('error', t.fail.bind(t));
  server.close(t.end.bind(t));
});

// https://github.com/nodejs/io.js/blob/master/test/parallel/test-net-listen-close-server-callback-is-not-function.js
test('createServer() listen & close in same tick with bad close argument', function (t) {
  var server = net.createServer(t.fail.bind(t));
  server.listen(0, t.fail.bind(t));
  server.on('error', t.fail.bind(t));
  server.on('close', t.end.bind(t));
  server.close('bad argument');
})
