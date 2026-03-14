require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const { connectRedis } = require("./src/config/redis");

connectToDB();
connectRedis();

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;