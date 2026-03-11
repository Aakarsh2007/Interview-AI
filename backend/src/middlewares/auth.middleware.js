const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");

async function authMiddleware(req, res, next) {
    try {
        // Debug: log incoming cookies to see if they reach server
        console.log("Cookies received:", req.cookies);

        // Get access token from cookies
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No token provided"
            });
        }

        // Check if the token is blacklisted in Redis
        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized: Token is blacklisted"
            });
        }

        // Verify the JWT token using the correct secret
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach the user info to request object
        req.user = decoded;

        // Proceed to the next middleware/controller
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        // Handle invalid or expired token
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;