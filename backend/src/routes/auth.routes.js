const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { loginLimiter, otpLimiter } = require("../middlewares/rateLimit.middleware");

const authRouter = Router();

authRouter.post("/register", authController.registerUserController);

authRouter.post("/login", loginLimiter, authController.loginUserController);

authRouter.post("/logout", authController.logoutUserController);

authRouter.get("/me", authMiddleware, authController.getMeController);

authRouter.post("/refresh-token", authController.refreshTokenController);

authRouter.post("/forgot-password", otpLimiter, authController.forgotPasswordController);

authRouter.post("/reset-password", authController.resetPasswordController);

module.exports = authRouter;