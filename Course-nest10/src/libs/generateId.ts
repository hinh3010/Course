import * as crypto from 'crypto';
interface IGenIdOptions {
  prefix?: string;
  length?: number;
}

export function generateId(options?: IGenIdOptions): string {
  const { prefix = '', length = 7 } = options ?? {};
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  const randomString = randomBytes.toString('hex');
  const accountId = prefix + randomString.toLowerCase().substring(0, length);
  return accountId;
}
