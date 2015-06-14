'use strict';

process.exitCode = 1;

const cp = require('child_process');
const finished = require('tap-finished');
const runtimeify = require('runtimeify');
const split = require('split');

runtimeify.builtins.http = require.resolve('http-node');
runtimeify.builtins.net = require.resolve('../index');

const input = process.argv.slice(2);
const files = input.length ?
  input.map(function (name) {
    return __dirname + '/' + name + '-test.js'
  }) : [
    __dirname + '/server-test.js',
    __dirname + '/connection-test.js',
    __dirname + '/http-test.js'
  ];

runtimeify({
  file: files,
  output :__dirname + '/initrd',
  debug: true
}, function (err) {
  if (err) {
    throw err;
  }

  const qemu = cp.spawn('runtime-qemu',
    [ `${__dirname}/initrd`, '--verbose', '--nographic' ]
  );

  qemu.stdout.pipe(finished(function (results) {
    process.exitCode = results.ok ? 0 : 1;
    qemu.kill('SIGINT');
  }));

  qemu.stdout.pipe(split()).on('data', function (chunk) {
    if (chunk.toString().indexOf('terminate thread') !== -1) {
      qemu.kill('SIGINT');
    }
  });

  qemu.stdout.pipe(process.stdout);
});
