'use strict';

const cp = require('child_process');
const tsml = require('tsml');
const runtimeify = cp.spawn('runtimeify', `${__dirname}/test.js -o ${__dirname}/initrd`.split(' '));
const finished = require('tap-finished');

runtimeify.once('close', function () {
  const qemu = cp.spawn('runtime-qemu', [`${__dirname}/initrd`]);

  qemu.stdout.pipe(finished(function (results) {
    qemu.kill('SIGINT');
    process.exit(results.ok ? 0 : 1);
  }));

  qemu.stdout.pipe(process.stdout);
})
