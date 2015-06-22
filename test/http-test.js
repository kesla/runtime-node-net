'use strict';

const test = require('tape');
const http = require('http');

test('GET client external request', function (t) {
  http.get('http://example.com', function (res) {
    t.equal(res.statusCode, 200, 'res.statusCode');
    t.end();
  });
});

test('GET client external request on(\'data\')' function (t) {
  http.get('http://example.com', function (res) {
    try {
      res.on('data', function(data) {
        t.pass();
      });
    } catch(e) {
      t.fail();
    }
  });
});

test('GET client external request on(\'end\')' function (t) {
  http.get('http://example.com', function (res) {
    res.on('data', function(data) {
      // nothing
    });
    try {
      res.on('end', function() {
        t.pass();
      });
    } catch(e) {
      t.fail();
    }
  });
});

test('simple GET server & client request', function (t) {
  const server = http.createServer(function (req, res) {
    t.equal(req.url, '/a/b/c', 'req.url');
    t.equal(req.method, 'GET', 'req.method');
    res.statusCode = 123;
    res.setHeader('foo', 'bas');
    res.write('world');
    res.end();
  });

  server.listen(0, function () {
    const port = server.address().port
    http.get('http://localhost:' + port + '/a/b/c', function (res) {
      t.equal(res.statusCode, 123, 'res.statusCode');
      t.equal(res.headers.foo, 'bas', 'res.headers.foo');
      server.close();
      t.end();
    });
  });
});
