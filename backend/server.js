require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const { connectRedis } = require("./src/config/redis");

const initializeDatabases = async () => {
    try {
        await connectToDB();
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error.message);
    }

    try {
        await connectRedis();
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Failed to connect to Redis", error.message);
    }
};

initializeDatabases();

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});