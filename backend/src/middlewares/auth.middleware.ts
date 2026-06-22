import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '../config/redis';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
    };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        console.log('Cookies received:', req.cookies);

        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            return res.status(401).json({
                message: 'Unauthorized: Token is blacklisted'
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '') as any;

        req.user = decoded;

        next();

    } catch (error) {
        console.error('Auth middleware error:', error);

        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
}
export default authMiddleware;
