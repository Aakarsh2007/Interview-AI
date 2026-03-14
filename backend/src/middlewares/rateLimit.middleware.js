const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        message: "Too many login attempts. Try again later."
    }
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        message: "Too many password reset requests. Please try again after 5 minutes."
    }
});

module.exports = {
    loginLimiter,
    otpLimiter
};