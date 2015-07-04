'use strict';

const test = require('tape');
const net = require('net');

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
    });
    clientSocket.once('end', function () {
      server.close(t.end.bind(t));
    });
  });
});

test('createConnection() multiple writes', function (t) {
  const net = require('net');
  const server = net.createServer(function(socket) {
    let chunks = '';
    socket.on('data', function(chunk) {
      chunks += chunk.toString();
    });
    socket.on('end', function() {
      t.equal(chunks, 'stuff\r\nhey\r\n');
      t.end();
      server.close();
    });
  });
  server.listen(0, function() {
    const client = net.createConnection({ port: server.address().port }, function() {
      client.write('stuff\r\n');
      client.write('hey\r\n');
      client.end();
    });
  });
});

test('createConnection() local with ip and callback', function (t) {
  const server = net.createServer(function (socket) {
    socket.end();
    server.close(t.end.bind(t));
  });

  server.listen(0, function () {
    const socket = net.createConnection(server.address().port, '127.0.0.1', function () {
      socket.end();
    });
  });
})

test('createConnection() local with object', function (t) {
  const server = net.createServer(function (socket) {
    socket.end();
    server.close(t.end.bind(t));
  });

  server.listen(0, function () {
    const socket = net.createConnection({
      port: server.address().port,
      host: '127.0.0.1'
    });

    socket.once('connect', function () {
      socket.end();
    });
  });
})

test('createConnection() local with object and callback', function (t) {
  const server = net.createServer(function (socket) {
    socket.end();
    server.close(t.end.bind(t));
  });

  server.listen(0, function () {
    const socket = net.createConnection({
      port: server.address().port,
      host: '127.0.0.1'
    }, function () {
      socket.end();
    });
  });
});

test('createConnection() localhost as host', function (t) {
  const server = net.createServer(function (socket) {
    socket.end();
    server.close(t.end.bind(t));
  });

  server.listen(0, function () {
    const socket = net.createConnection({
      port: server.address().port,
      host: 'localhost'
    }, function () {
      socket.end();
    });
  });
});

test('createConnection() with external host', function (t) {
  let async = false;
  const socket = net.createConnection(80, 'example.com', function () {
    t.ok(async, 'should be async');
    t.end();
    socket.end();
  });
  async = true;
});

// adapted from https://github.com/nodejs/io.js/blob/master/test/parallel/test-net-dns-lookup.js
test('createConnection() localhost dns lookup', function (t) {
  t.plan(3);
  let ok = false;
  const server = net.createServer(function(client) {
    client.end();
    server.close();
    t.end();
  });

  server.listen(0, '127.0.0.1', function() {
    const port = server.address().port;
    net.createConnection(port, 'localhost').on('lookup', function(err, ip, type) {
      t.equal(err, null, 'no error');
      t.equal(ip, '127.0.0.1', 'ip');
      t.equal(type, 4, 'type');
    });
  });
});

test('createConnection() google.com dns lookup', function (t) {
  const socket = net.createConnection(80, 'google.com')
  socket.on('lookup', function (err, ip, type) {
    t.equal(err, null, 'no error');
    t.ok(net.isIP(ip), 'ip');
    t.equal(type, 4, 'type');
    t.end();
    socket.destroy();
  });
});

// adapted from https://github.com/nodejs/io.js/blob/master/test/parallel/test-net-pause-resume-connecting.js
test('createConnection() pause, resume, connecting', function (t) {
  let connections = 0;
  let dataEvents = 0;

  // Server
  const server = net.createServer(function(conn) {
    connections++;
    conn.end('This was the year he fell to pieces.');

    if (connections === 5) {
      server.close();
      setTimeout(function () {
        t.equal(dataEvents, 3);
        t.end();
      }, 100);
    }
  });

  server.listen(0, function () {
    const port = server.address().port;
    let conn;

    // Client 1
    conn = net.createConnection(port, 'localhost');
    conn.resume();
    conn.on('data', onDataOk);


    // Client 2
    conn = net.createConnection(port, 'localhost');
    conn.pause();
    conn.resume();
    conn.on('data', onDataOk);


    // Client 3
    conn = net.createConnection(port, 'localhost');
    conn.pause();
    conn.on('data', onDataError);
    scheduleTearDown(conn);


    // Client 4
    conn = net.createConnection(port, 'localhost');
    conn.resume();
    conn.pause();
    conn.resume();
    conn.on('data', onDataOk);


    // Client 5
    conn = net.createConnection(port, 'localhost');
    conn.resume();
    conn.resume();
    conn.pause();
    conn.on('data', onDataError);
    scheduleTearDown(conn);
  });

  // Client helper functions
  function onDataError() {
    t.fail('should not get data');
  }

  function onDataOk() {
    dataEvents++;
  }

  function scheduleTearDown(conn) {
    setTimeout(function() {
      conn.removeAllListeners('data');
      conn.resume();
    }, 100);
  }
});
