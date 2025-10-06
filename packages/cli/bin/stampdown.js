#!/usr/bin/env node
const { StampdownCLI } = require('../dist/cli.js');

const cli = new StampdownCLI();
cli
  .run(process.argv.slice(2))
  .then(() => {
    // Success
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
