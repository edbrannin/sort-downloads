#!/usr/bin/env node
// eslint-disable-next-line import/no-unresolved
import chalk from 'chalk';
import figlet from 'figlet';
import yargs from 'yargs';
import { main } from './index';

const { argv } = yargs.options({
// b: { type: 'string', demandOption: true },
// c: { type: 'number', alias: 'chill' },
// d: { type: 'array' },
// e: { type: 'count' },
// f: { choices: ['1', '2', '3'] },
  d: { type: 'boolean', alias: 'dry-run', default: false },
  v: { type: 'boolean', alias: 'verbose', default: false },
});

const mainArgs = async (inputs: typeof argv) => {
  const args = await inputs;
  main({
    dryRun: args.d,
    verbose: args.v,
  });
};

if (module === require.main) {
  try {
    console.log(chalk.green(figlet.textSync('sort-downloads')));

    mainArgs(argv);
  } catch (e) {
    console.error('Uncaught exception in main:', e);
  }
}
