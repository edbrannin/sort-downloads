import { homedir } from 'os';
import { join } from 'path';
import getSorter, { itchJamMatcher, itchMatcher } from '../src/sort';

const ITCH_JAM_URL = new URL('https://itch.io/jam/one-page-rpg-jam-2022/rate/1627757');
const ITCH_PROFILE_URL = new URL('https://chrispwolf.itch.io/');
const ITCH_PAGE_URL = new URL('https://chrispwolf.itch.io/offworlders');
const ITCH_DOWNLOAD_URL = new URL('https://shonen413.itch.io/derelict/download/redacted');
const PRINTABLES_URL = new URL('https://www.printables.com/');
const THINGIVERSE_URL = new URL('https://www.thingiverse.com/');

describe('itchMatcher', () => {
  it('should match itch.io profiles', () => {
    expect(itchMatcher('foo', ITCH_PROFILE_URL)).toEqual('chrispwolf.itch.io');
  });

  it('should match itch.io game pages', () => {
    expect(itchMatcher('foo', ITCH_PAGE_URL)).toEqual('chrispwolf.itch.io/offworlders');
  });

  it('should match itch.io download links', () => {
    expect(itchMatcher('foo', ITCH_DOWNLOAD_URL)).toEqual('shonen413.itch.io/derelict');
  });

  it('should not match jam URLs', () => {
    expect(itchMatcher('jam', ITCH_JAM_URL)).toBeFalsy();
  });
});

describe('itchJamMatcher', () => {
  it('should match itch.io profiles', () => {
    expect(itchJamMatcher('foo', ITCH_PROFILE_URL)).toBeFalsy();
  });

  it('should match itch.io game pages', () => {
    expect(itchJamMatcher('foo', ITCH_PAGE_URL)).toBeFalsy();
  });

  it('should match itch.io download links', () => {
    expect(itchJamMatcher('foo', ITCH_DOWNLOAD_URL)).toBeFalsy();
  });

  it('should not match jam URLs', () => {
    expect(itchJamMatcher('jam', ITCH_JAM_URL)).toEqual('jams/one-page-rpg-jam-2022');
  });
});

describe('getSorter', () => {
  it('should match itch.io games', () => {
    const { getDestination, matcherCounts } = getSorter();
    expect(getDestination('foo.pdf', new URL('https://something.itch.io/the-foo'))).toEqual(
      'something.itch.io/the-foo',
    );
    expect([...matcherCounts.keys()]).toHaveLength(1);
    expect(matcherCounts.get('itchMatcher')).toEqual(1);
  });

  it('should match itch.io jam games', () => {
    const { getDestination, matcherCounts } = getSorter();
    expect(getDestination('foo.pdf', ITCH_JAM_URL)).toEqual('jams/one-page-rpg-jam-2022');
    expect([...matcherCounts.keys()]).toHaveLength(1);
    expect(matcherCounts.get('itchJamMatcher')).toEqual(1);
  });

  it('should match 3d printing stuff', () => {
    const { getDestination, matcherCounts } = getSorter();
    const printPath = join(homedir(), 'Dropbox', '3d-printing');
    expect(getDestination('foo.pdf', PRINTABLES_URL)).toEqual(join(printPath, 'Printables'));
    expect(getDestination('foo.pdf', THINGIVERSE_URL)).toEqual(join(printPath, 'Thingiverse'));
    expect(getDestination('foo.stl', new URL('http://example.com'))).toEqual(printPath);
    expect(getDestination('foo.STL', new URL('http://example.com'))).toEqual(printPath);
    expect(getDestination('foo.3mf', new URL('http://example.com'))).toEqual(printPath);
    expect(matcherCounts.get('print3dMatcher')).toEqual(5);
    expect([...matcherCounts.keys()]).toHaveLength(1);
  });
});
