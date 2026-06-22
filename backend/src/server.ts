import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectToDB } from './config/database';
import { connectRedis } from './config/redis';

async function startServer() {
    try {
        // Core systems initialization
        await connectToDB();
        await connectRedis();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
