import { Router } from 'express';
import {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    refreshTokenController,
    forgotPasswordController,
    resetPasswordController
} from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { loginLimiter, otpLimiter } from '../middlewares/rateLimit.middleware';

const authRouter = Router();

authRouter.post('/register', registerUserController);
authRouter.post('/login', loginLimiter, loginUserController);
authRouter.post('/logout', logoutUserController);
authRouter.get('/me', authMiddleware as any, getMeController as any);
authRouter.post('/refresh-token', refreshTokenController);
authRouter.post('/forgot-password', otpLimiter, forgotPasswordController);
authRouter.post('/reset-password', resetPasswordController);

export default authRouter;
