#!/usr/bin/env node
// eslint-disable-next-line import/no-unresolved
import chalk from 'chalk';
import figlet from 'figlet';
import yargs from 'yargs';
import { main } from './index';

const { argv } = yargs.options({
  dryRun: { type: 'boolean', alias: 'd', default: false },
  verbose: { type: 'boolean', alias: 'v', default: false },
  report: { type: 'boolean', alias: 'r', default: false },
});

const mainArgs = async (inputs: typeof argv) => {
  const args = await inputs;
  main({
    dryRun: args.dryRun,
    verbose: args.verbose,
    report: args.report,
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
