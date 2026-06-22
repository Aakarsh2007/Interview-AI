import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import "../auth.form.scss";
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await handleLogin({ email, password });
            toast.success("Welcome back!");
            navigate('/');
        } catch (err) {
            setError("Invalid email or password");
            toast.error("Login failed. Please check credentials.");
        }
    };

    if (loading) {
        return (
            <main>
                <h1 className="pulse-loader" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Loading Session...</h1>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Welcome Back</h1>
                {error && <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" 
                            id="email" 
                            placeholder='Enter your email address' 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="password">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem' }}>Forgot Password?</Link>
                        </div>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" 
                            id="password" 
                            placeholder='Enter your password' 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className='glow-btn' style={{ marginTop: '0.5rem' }}>Login</button>
                </form>
                
                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    );
};

export default Login;
