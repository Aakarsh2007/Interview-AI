import React, { ReactNode } from 'react';
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";

interface ProtectedProps {
  children: ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <h1 className="pulse-loader" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Loading Session...</h1>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

export default Protected;
