import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { forgotPassword, resetPassword } from '../services/auth.api';
import toast from 'react-hot-toast';
import "../auth.form.scss";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await forgotPassword(email);
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send OTP. Check email and try again.");
            toast.error("Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await resetPassword({ email, otp, newPassword });
            toast.success("Password reset successful! Please login.");
            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid OTP or request expired.");
            toast.error("Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <div className="form-container">
                <h1>Reset Password</h1>
                {error && <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>{error}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendEmail}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                            Enter your email address and we will send you a 6-digit OTP.
                        </p>
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email" 
                                id="email" 
                                required 
                                placeholder='Enter your account email' 
                            />
                        </div>
                        <button type="submit" className='glow-btn' style={{ marginTop: '0.5rem' }} disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <p style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                            OTP sent to {email}
                        </p>
                        <div className="input-group">
                            <label htmlFor="otp">6-Digit OTP</label>
                            <input
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                type="text" 
                                id="otp" 
                                required 
                                placeholder='Enter OTP from email' 
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                                type="password" 
                                id="newPassword" 
                                required 
                                placeholder='Enter new password' 
                            />
                        </div>
                        <button type="submit" className='glow-btn' style={{ marginTop: '0.5rem' }} disabled={loading}>
                            {loading ? "Resetting Password..." : "Set New Password"}
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <Link to="/login">Back to Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;
