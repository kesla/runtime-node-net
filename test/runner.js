'use strict';

process.exitCode = 1;

const cp = require('child_process');
const finished = require('tap-finished');

const runtimeify = require('runtimeify');

runtimeify.builtins.http = require.resolve('http-node');
runtimeify.builtins.net = require.resolve('../index');

runtimeify({
  file: [ __dirname + '/test.js', __dirname + '/http-test.js'],
  output :__dirname + '/initrd',
  debug: true
}, function (err) {
  if (err) {
    throw err;
  }

  const qemu = cp.spawn('runtime-qemu', [ `${__dirname}/initrd`, '--verbose', '--nographic' ]);

  qemu.stdout.pipe(finished(function (results) {
    qemu.kill('SIGINT');
    process.exit(results.ok ? 0 : 1);
  }));

  qemu.stdout.pipe(process.stdout);
});
