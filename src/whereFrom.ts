import exec from './execAsync';

export const whereFrom = async (path: string): Promise<URL[]> => {
  // console.log()
  // console.log(path)
  if (path.includes('"')) {
    console.warn('Files with quotes are unspported: ', path);
    return [];
  }
  try {
    const {
      stdout,
      // stderr,
    } = await exec(`where-from -s "${path}"`);

    // console.log('stdout:', stdout);
    // console.log('stderr:', stderr);

    if (stdout !== '') {
      const lines = stdout.split('\n').filter((x) => x.length > 0);
      return lines.map((line) => new URL(line));
    }
  } catch (err) {
    // Ignore nonzero exit status
  }
  return [];
};

export default whereFrom;
