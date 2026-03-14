const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");

async function authMiddleware(req, res, next) {
    try {
        console.log("Cookies received:", req.cookies);

        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No token provided"
            });
        }

        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized: Token is blacklisted"
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;