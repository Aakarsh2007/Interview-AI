import { createClient } from 'redis';

export const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

export async function connectRedis(): Promise<void> {
    try {
        await redisClient.connect();
        console.log('Redis connected');
    } catch (err) {
        console.error('Redis connection failed:', err);
    }
}
