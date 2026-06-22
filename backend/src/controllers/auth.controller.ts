import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import userModel from '../models/user.model';
import { redisClient } from '../config/redis';
import { sendEmail } from '../utils/sendEmail';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax'
};

// Zod Validation Schemas
export const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(30),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.union([z.number(), z.string()]),
    newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export async function registerUserController(req: Request, res: Response): Promise<any> {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { username, email, password } = validation.data;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: 'Account already exists'
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.ACCESS_TOKEN_SECRET || 'access_secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        console.error('Registration Error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

export async function loginUserController(req: Request, res: Response): Promise<any> {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { email, password } = validation.data;

        const user = await userModel.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.ACCESS_TOKEN_SECRET || 'access_secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        console.error('Login Error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

export async function logoutUserController(req: Request, res: Response): Promise<any> {
    try {
        const token = req.cookies?.accessToken;

        if (token) {
            await redisClient.set(token, 'blacklisted', {
                EX: 900
            });
        }

        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);

        return res.json({
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        console.error('Logout Error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

export async function getMeController(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await userModel.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ user });
    } catch (error: any) {
        console.error('GetMe Error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

export async function refreshTokenController(req: Request, res: Response): Promise<any> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: 'Refresh token missing'
        });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET || 'refresh_secret'
        ) as any;

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.ACCESS_TOKEN_SECRET || 'access_secret',
            { expiresIn: '15m' }
        );

        res.cookie('accessToken', accessToken, cookieOptions);

        return res.json({
            message: 'New access token generated'
        });
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired refresh token'
        });
    }
}

export async function forgotPasswordController(req: Request, res: Response): Promise<any> {
    try {
        const validation = forgotPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { email } = validation.data;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        await redisClient.set(
            `otp:${email}`,
            otp.toString(),
            { EX: 300 }
        );

        await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}`);

        return res.json({
            message: 'OTP sent to email'
        });
    } catch (error: any) {
        console.error('ForgotPassword Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function resetPasswordController(req: Request, res: Response): Promise<any> {
    try {
        const validation = resetPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.format()
            });
        }

        const { email, otp, newPassword } = validation.data;
        const storedOtp = await redisClient.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp.toString()) {
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await userModel.updateOne(
            { email },
            { password: hash }
        );

        await redisClient.del(`otp:${email}`);

        return res.json({
            message: 'Password reset successful'
        });
    } catch (error: any) {
        console.error('ResetPassword Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}
