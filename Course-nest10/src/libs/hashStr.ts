import * as crypto from 'crypto';

const salt = 'hellocacbantre';
export async function hashStr(str: string): Promise<string> {
  const hashedPassword = crypto.pbkdf2Sync(str, salt, 1000, 64, 'sha512').toString('hex');
  return hashedPassword;
}
