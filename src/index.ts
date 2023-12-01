// import * as fs from 'fs/promises';
import fs from 'fs-extra';

import { join } from 'path';
import { whereFrom } from './whereFrom';
import getSorter from './sort';

// eslint-disable-next-line import/prefer-default-export
export function myFunc(): void {
  console.info('libary');
}

export type MainOpts = {
  dryRun: boolean;
  verbose: boolean;
  report: boolean;
};

export const printDomainReport = (domainCounts: Map<string, number>): void => {
  const countsAndValues = [...domainCounts.entries()]
    .map(([domain, count]) => [count, domain] as [number, string])
    .sort()
    .map(([count, domain]) => [domain, count] as [string, number]);

  console.log();
  console.log('Count\tDomain');
  countsAndValues.forEach(([domain, count]) => console.log(`${count}\t${domain}`));
};

export const main = async ({ dryRun = true, verbose = true, report = false }: MainOpts) => {
  const { sort, matcherCounts } = getSorter();

  const domainCounts: Map<string, number> = new Map();
  const incrementCount = (name: string) => {
    if (report) {
      domainCounts.set(name, (domainCounts.get(name) || 0) + 1);
    }
  };

  const dirPath = '.';
  const files = await fs.readdir(dirPath, { withFileTypes: true });
  console.log(`Looking at ${files.length} files`);
  for (let x = 0; x < files.length; x += 1) {
    const file = files[x];
    if (!file.isDirectory()) {
      const { name } = file;
      const path = join(dirPath, name);
      // eslint-disable-next-line no-await-in-loop
      const sourceUrls = await whereFrom(name);
      // console.log("urls:", sourceUrls);
      // eslint-disable-next-line no-await-in-loop
      const destination = await sort(name, sourceUrls);

      if (destination) {
        if (dryRun) {
          console.log(`Would move ${name} to ${destination}`);
        } else {
          if (verbose) {
            console.log(`Moving "${name}" to "${destination}"`);
          }
          try {
            // eslint-disable-next-line no-await-in-loop
            await fs.mkdirs(destination);
            // eslint-disable-next-line no-await-in-loop
            await fs.move(path, join(destination, name));
            console.log(`Moved "${name}" to "${destination}"`);
          } catch (err) {
            console.error(`Error moving "${name}" to "${destination}":`, err);
          }
        }
      } else if (sourceUrls.length > 0) {
        if (verbose) {
          console.log(
            `No matcher for ${name} from:${sourceUrls.map((url) => `\n- ${url}`).join()}`,
          );
        }
        sourceUrls.forEach((url) => incrementCount(url.hostname));
      } else {
        // console.log("No URLs for ", name);
        incrementCount('NO_URL');
      }
    }
  }

  if (report) {
    printDomainReport(domainCounts);
  }

  console.log('Totals:');
  [...matcherCounts.entries()].forEach(([name, count]) => console.log(`${count}\t${name}`));
};
