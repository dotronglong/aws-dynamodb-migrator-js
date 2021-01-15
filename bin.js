#!/usr/bin/env node
const AWS = require("aws-sdk");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const Migrator = require("./index");

if (argv.region !== undefined && argv.endpoint !== undefined) {
  AWS.config.update({
    region: argv.region,
    endpoint: argv.endpoint
  });
}

if (argv.path !== undefined) {
  const migrator = new Migrator();
  migrator.migrate(argv.path);
}