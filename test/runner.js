'use strict';

const cp = require('child_process');
const tsml = require('tsml');
const cmd = `runtimeify ${__dirname}/test.js -o ${__dirname}/initrd &&
  runtime-qemu ${__dirname}/initrd`;
const child = cp.exec(cmd);
const finished = require('tap-finished');

child.stdout.pipe(finished(function (results) {
  process.exit(results.ok ? 0 : 1);
}));

child.stdout.pipe(process.stdout);
