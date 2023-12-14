import Redis, { type Redis as RedisClient } from 'ioredis';

function createConnectRedis(): RedisClient {
  const redis: RedisClient = new Redis(process.env.REDIS_URI, {
    connectTimeout: 5000, // maximum time to connect to Redis, default is 10S
    enableReadyCheck: true, // check Redis connection before starting to use
    maxRetriesPerRequest: 5, // max reconnects per command execution, default is 20
    retryStrategy: (times) => (times <= 3 ? 1000 : null), // try reconnecting after the number of seconds returned.
  });

  redis.on('connect', () => {
    console.log('[RedisIo:::] connected!!');
  });

  redis.on('ready', () => {
    console.log('[RedisIo:::] ready!!');
  });

  redis.on('reconnecting', () => {
    console.log('[RedisIo:::] reconnecting!!');
  });

  redis.on('end', () => {
    console.log('[RedisIo:::] disconnected!!');
  });

  redis.on('error', (err) => {
    console.log(`[RedisIo:::] error ${err.message}`);
  });

  return redis;
}

export const redisClient = createConnectRedis();
