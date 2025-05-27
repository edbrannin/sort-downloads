#!/usr/bin/env node

import { homedir } from 'os';
import { join, basename } from 'path';

type MatchFunction = (path: string, url: URL) => string | undefined;

const ITCH_PAGE = /^https?:\/\/(([^.]+\.itch\.io)\/([^/]+)?)(\/[/a-zA-Z0-9%._-]*)?$/;
export const itchMatcher: MatchFunction = (_, url) => {
  const match = ITCH_PAGE.exec(url.href);
  // console.log('itchMatcher', url.href, match);
  if (match) {
    if (match[3]) {
      return match[1];
    }
    return match[2];
  }
  return undefined;
};

const ITCH_JAM_REGEX = /^https?:\/\/itch.io\/jam\/([^/]+)\/.*$/;
export const itchJamMatcher: MatchFunction = (_, url) => {
  const match = ITCH_JAM_REGEX.exec(url.href);
  if (match) {
    return `jams/${match[1]}`;
  }
  return undefined;
};

const STL_DIR = join(homedir(), 'Dropbox', '3d-printing');
export const print3dMatcher: MatchFunction = (path, url) => {
  if (url.hostname.endsWith('printables.com')) {
    return join(STL_DIR, 'Printables');
  }
  if (url.hostname.endsWith('thingiverse.com')) {
    return join(STL_DIR, 'Thingiverse');
  }
  if (path.toLowerCase().endsWith('.stl')) {
    return STL_DIR;
  }
  if (path.toLowerCase().endsWith('.3mf')) {
    return STL_DIR;
  }
  return undefined;
};

const BOOKS_DIR = join(homedir(), 'Dropbox', 'Books');
export const gutenbergMatcher: MatchFunction = (_, url) => {
  if (url.hostname.endsWith('gutenberg.org') && url.pathname.startsWith('/ebooks')) {
    return BOOKS_DIR;
  }
  return undefined;
};

const pnpArcadeMatcher: MatchFunction = (_, url) => {
  if (url.hostname.endsWith('pnparcade.com')) {
    return 'pnpArcade';
  }
  return undefined;
};

const SAVEGAMES_DIR = join(homedir(), 'Dropbox', 'Fun', 'Gaming-video', 'Saves');
const goobooMatcher: MatchFunction = (path, _) => {
  if (basename(path).startsWith('Gooboo_') && path.endsWith('.txt')) {
    return join(SAVEGAMES_DIR, 'Gooboo');
  }
  return undefined;
};

const matchers: Record<string, MatchFunction> = {
  itchMatcher,
  itchJamMatcher,
  print3dMatcher,
  gutenbergMatcher,
  pnpArcadeMatcher,
  goobooMatcher,
};

type MatcherKey = keyof typeof matchers;
type MatcherMap<T> = Map<MatcherKey, T>;

const getSorter = () => {
  const results = new Map<string, string>();
  const matcherCounts: MatcherMap<number> = new Map();
  const incrementCount = (name: MatcherKey) =>
    matcherCounts.set(name, (matcherCounts.get(name) || 0) + 1);
  const getDestination: MatchFunction = (path, url) => {
    if (!url) {
      return undefined;
    }
    const matcherNames = Object.keys(matchers);
    for (let x = 0; x < matcherNames.length; x += 1) {
      const name = matcherNames[x];
      const matcher = matchers[name];
      const result = matcher(path, url);
      if (result) {
        incrementCount(name);
        return result;
      }
    }
    return undefined;
  };

  const sort = async (path: string, sourceUrls: URL[]): Promise<string | undefined> => {
    if (sourceUrls.length === 0) {
      incrementCount('noUrl');
      return undefined;
    }
    for (let su = 0; su < sourceUrls.length; su += 1) {
      const sourceUrl = sourceUrls[su];

      // console.log(`${path} is from ${sourceUrl.hostname}: ${sourceUrl}`);
      // eslint-disable-next-line no-await-in-loop
      const destination = await getDestination(path, sourceUrl);
      if (destination) {
        return destination;
      }
    }
    incrementCount('noMatch');
    return undefined;
  };

  return {
    sort,
    getDestination,
    matcherCounts,
    results,
  };
};

export default getSorter;
