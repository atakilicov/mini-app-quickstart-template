import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
    if (!redis) {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is not set');
        }

        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
    }

    return redis;
}
