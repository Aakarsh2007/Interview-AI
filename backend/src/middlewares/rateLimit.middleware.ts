import { rateLimit } from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        message: 'Too many login attempts. Try again later.'
    }
});

export const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3,
    message: {
        message: 'Too many password reset requests. Please try again after 5 minutes.'
    }
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        message: 'Too many requests from this IP. Please try again later.'
    }
});
