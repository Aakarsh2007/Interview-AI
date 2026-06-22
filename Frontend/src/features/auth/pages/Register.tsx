import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { loading, handleRegister } = useAuth();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await handleRegister({ username, email, password });
            toast.success("Account created successfully!");
            navigate("/");
        } catch (error) {
            toast.error("Registration failed. Try again.");
        }
    };

    if (loading) {
        return (
            <main>
                <h1 className="pulse-loader" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Creating Account...</h1>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Create Account</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" 
                            id="username" 
                            placeholder='Choose a username' 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" 
                            id="email" 
                            placeholder='Enter your email' 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" 
                            id="password" 
                            placeholder='Choose a password' 
                            required 
                        />
                    </div>

                    <button type="submit" className='glow-btn' style={{ marginTop: '0.5rem' }}>Register</button>
                </form>

                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </main>
    );
};

export default Register;
