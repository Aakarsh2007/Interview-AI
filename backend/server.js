require("dotenv").config();
const app = require("./src/app"); // your express app
const connectToDB = require("./src/config/database");
const { connectRedis } = require("./src/config/redis");

// Connect to DB and Redis
connectToDB();
connectRedis();

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});