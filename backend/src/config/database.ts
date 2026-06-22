import mongoose from 'mongoose';

export async function connectToDB(): Promise<void> {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            throw new Error('Database connection URI is not defined in env variables.');
        }
        await mongoose.connect(uri);
        console.log('Database is connected');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}
