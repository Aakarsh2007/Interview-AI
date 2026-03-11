import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { forgotPassword, resetPassword } from '../services/auth.api';
import "../auth.form.scss";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form Data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await forgotPassword(email);
            setStep(2); // Move to the OTP screen
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Check email and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await resetPassword({ email, otp, newPassword });
            alert("Password reset successful! Please login with your new password.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP or request expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <div className="form-container">
                <h1>Reset Password</h1>
                {error && <p style={{ color: '#ff4d4d', fontSize: '0.85rem' }}>{error}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendEmail}>
                        <p style={{ color: '#7d8590', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Enter your email address and we will send you a 6-digit OTP.
                        </p>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email" id="email" required placeholder='Enter your account email' />
                        </div>
                        <button className='button primary-button' disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <p style={{ color: '#3fb950', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            OTP sent to {email}
                        </p>
                        <div className="input-group">
                            <label htmlFor="otp">6-Digit OTP</label>
                            <input
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                type="text" id="otp" required placeholder='Enter OTP from email' />
                        </div>
                        <div className="input-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                                type="password" id="newPassword" required placeholder='Enter new password' />
                        </div>
                        <button className='button primary-button' disabled={loading}>
                            {loading ? "Resetting..." : "Set New Password"}
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.9rem' }}>
                    <Link to={"/login"}>Back to Login</Link>
                    <Link to={"/register"}>Register</Link>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;