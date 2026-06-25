import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router';

interface QAItem {
  question: string;
  userAnswer: string;
  aiFeedback: string;
  score: number;
  durationSeconds?: number;
  isSpoken?: boolean;
}

interface MockDetails {
  _id: string;
  jobTitle: string;
  totalScore: number;
  qaList: QAItem[];
  createdAt: string;
}

const MockInterviewResult: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    const mock = state?.mock as MockDetails | undefined;

    if (!mock) {
        return <Navigate to="/" />;
    }

    const scoreColor = mock.totalScore >= 70 ? 'var(--accent-emerald)' : mock.totalScore >= 40 ? 'var(--accent-amber)' : 'var(--accent-rose)';

    const countFillerWords = (text: string) => {
        const matches = text.match(/\b(um|uh|like|ah|you know|so|actually)\b/gi);
        return matches ? matches.length : 0;
    };

    const calculateWpm = (text: string, seconds: number) => {
        if (!seconds || seconds <= 0) return 0;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        return Math.round((words / seconds) * 60);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: 0, fontWeight: 600 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Dashboard
                </button>
                <span style={{ color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: 500 }}>Completed on {new Date(mock.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Score Overview Panel */}
            <div 
                className="glass-panel" 
                style={{ 
                    padding: '2.5rem', 
                    marginBottom: '2.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '2.5rem', 
                    borderLeft: `4px solid ${scoreColor}`,
                    background: 'radial-gradient(circle at 10% 20%, rgba(143,68,253,0.05) 0%, transparent 100%)'
                }}
            >
                <div style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%', 
                    border: `4px solid ${scoreColor}`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '2.2rem', 
                    fontWeight: 800, 
                    color: scoreColor,
                    boxShadow: `0 0 20px ${scoreColor}25`,
                    background: 'var(--bg-primary)'
                }}>
                    {mock.totalScore}
                </div>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 800 }}>{mock.jobTitle}</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Overall Mock Interview Score</p>
                </div>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Detailed Question Breakdown</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {mock.qaList.map((qa, index) => {
                    const fillerCount = countFillerWords(qa.userAnswer);
                    const spokenWpm = qa.durationSeconds ? calculateWpm(qa.userAnswer, qa.durationSeconds) : 0;

                    return (
                        <div key={index} className="glass-panel" style={{ overflow: 'hidden' }}>
                            
                            {/* Question Title Header */}
                            <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 800, fontSize: '1.25rem', background: 'rgba(255, 45, 120, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255, 45, 120, 0.2)' }}>Q{index + 1}</span>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', lineHeight: '1.5', fontWeight: 600 }}>{qa.question}</h3>
                                </div>
                            </div>

                            {/* Answers and Feedback */}
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 700 }}>Your Answer:</span>
                                    <p style={{ margin: 0, color: 'var(--text-main)', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', border: '1px solid var(--border-color)' }}>
                                        "{qa.userAnswer}"
                                    </p>
                                </div>

                                {/* Speech Delivery Stats if Spoken */}
                                {qa.isSpoken && qa.durationSeconds && qa.durationSeconds > 0 && (
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.8rem 1.2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            ⏱️ Speaking duration: <strong style={{ color: '#fff' }}>{qa.durationSeconds} seconds</strong>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            🎙️ Pacing speed: <strong style={{ color: spokenWpm >= 110 && spokenWpm <= 150 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{spokenWpm} WPM</strong> ({spokenWpm >= 110 && spokenWpm <= 150 ? 'Ideal' : spokenWpm > 150 ? 'Fast' : 'Slow'})
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            ⚠️ Filler words used: <strong style={{ color: fillerCount > 3 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{fillerCount}</strong>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>AI Feedback:</span>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: qa.score >= 7 ? 'var(--accent-emerald)' : 'var(--accent-amber)', background: qa.score >= 7 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                                            Score: {qa.score} / 10
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.9rem' }}>{qa.aiFeedback}</p>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default MockInterviewResult;
