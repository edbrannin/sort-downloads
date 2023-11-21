import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export default execAsync;
