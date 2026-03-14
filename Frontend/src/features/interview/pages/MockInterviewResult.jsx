import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router';

const MockInterviewResult = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    const mock = state?.mock;

    if (!mock) {
        return <Navigate to="/" />;
    }

    const scoreColor = mock.totalScore >= 70 ? '#3fb950' : mock.totalScore >= 40 ? '#d29922' : '#da3633';

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', color: '#e1e7ef', fontFamily: 'system-ui, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: 0 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Dashboard
                </button>
                <span style={{ color: '#8b949e' }}>Completed on {new Date(mock.createdAt).toLocaleDateString()}</span>
            </div>

            <div style={{ background: '#14171c', border: `1px solid ${scoreColor}`, borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: `0 0 20px ${scoreColor}20` }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `4px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: scoreColor }}>
                    {mock.totalScore}
                </div>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{mock.jobTitle}</h1>
                    <p style={{ margin: 0, color: '#a0aab8', fontSize: '1.1rem' }}>Overall Mock Interview Score</p>
                </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #3c4453', paddingBottom: '0.5rem' }}>Detailed Breakdown</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {mock.qaList.map((qa, index) => (
                    <div key={index} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden' }}>
                        
                        <div style={{ background: '#1a1d24', padding: '1.5rem', borderBottom: '1px solid #30363d' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: '#ff2d78', fontWeight: 'bold', fontSize: '1.2rem' }}>Q{index + 1}</span>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', lineHeight: '1.5' }}>{qa.question}</h3>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a0aab8', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Answer:</span>
                                <p style={{ margin: 0, color: '#c9d1d9', fontStyle: 'italic', lineHeight: '1.6', background: '#161b22', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid #58a6ff' }}>
                                    "{qa.userAnswer}"
                                </p>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a0aab8', fontWeight: 'bold' }}>AI Evaluation:</span>
                                    <span style={{ fontWeight: 'bold', color: qa.score >= 7 ? '#3fb950' : '#d29922' }}>Score: {qa.score}/10</span>
                                </div>
                                <p style={{ margin: 0, color: '#8b949e', lineHeight: '1.6' }}>{qa.aiFeedback}</p>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default MockInterviewResult;
