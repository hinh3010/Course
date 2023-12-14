import * as crypto from 'crypto';

const salt = 'hellocacbantre';
export function compareStr(str: string, hashedStr: string): boolean {
  const inputHashed = crypto.pbkdf2Sync(str, salt, 1000, 64, 'sha512').toString('hex');
  return inputHashed === hashedStr;
}
