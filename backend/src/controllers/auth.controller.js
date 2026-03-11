const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");
const sendEmail = require("../utils/sendEmail"); // Assuming this is the path based on your setup

// REGISTER
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email, password"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        // Use the standardized Access/Refresh token system
        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS in production
            sameSite: "lax"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS in production
            sameSite: "lax"
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// LOGIN
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax"
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// LOGOUT
async function logoutUserController(req, res) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(400).json({
                message: "No token provided"
            });
        }

        // Blacklist the token for 15 minutes (900 seconds)
        await redisClient.set(token, "blacklisted", {
            EX: 900
        });

        // Clear both cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// GET ME
async function getMeController(req, res) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("-password");

        if (!user) {
             return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// REFRESH TOKEN
async function refreshTokenController(req, res) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token missing"
        });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Security check: Ensure user still exists before issuing new access token
        const user = await userModel.findById(decoded.id);
        if (!user) {
             return res.status(401).json({ message: "User no longer exists" });
        }

        const accessToken = jwt.sign(
            { id: user._id, username: user.username }, // Included username to match initial generation
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax"
        });

        res.json({
            message: "New access token generated"
        });
    } catch (err) {
        res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
}

// FORGOT PASSWORD
async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        await redisClient.set(
            `otp:${email}`,
            otp,
            { EX: 300 } // 5 minutes
        );

        await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

        res.json({
            message: "OTP sent to email"
        });
    } catch (error) {
         res.status(500).json({ message: "Server error", error: error.message });
    }
}

// RESET PASSWORD
async function resetPasswordController(req, res) {
    try {
        const { email, otp, newPassword } = req.body;
        const storedOtp = await redisClient.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp.toString()) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await userModel.updateOne(
            { email },
            { password: hash }
        );

        await redisClient.del(`otp:${email}`);

        res.json({
            message: "Password reset successful"
        });
    } catch (error) {
         res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    refreshTokenController,
    forgotPasswordController,
    resetPasswordController
};