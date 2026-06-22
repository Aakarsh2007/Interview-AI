import React, { useState, useEffect } from 'react';
import { useInterview } from '../hooks/useInterview';
import { getAllMockInterviews, deleteMockInterview } from '../services/interview.api';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/hooks/useAuth';
import { MockAnalytics } from '../components/MockAnalytics';
import '../style/home.scss';

interface MockInterview {
  _id: string;
  interviewReport: string;
  jobTitle: string;
  totalScore: number;
  qaList: any[];
  createdAt: string;
}

const Home: React.FC = () => {
    const { generateReport, reports, getReports, loading, deleteReport } = useInterview();
    const { handleLogout } = useAuth();
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    // Modern custom tracking params
    const [role, setRole] = useState('Software Engineer');
    const [company, setCompany] = useState('General');
    const [experienceLevel, setExperienceLevel] = useState('Mid-Level');

    const [activeTab, setActiveTab] = useState<'strategies' | 'mocks' | 'analytics'>('strategies');
    const [mockInterviews, setMockInterviews] = useState<MockInterview[]>([]);

    useEffect(() => {
        getReports();
        fetchMockHistory();
    }, []);

    const fetchMockHistory = async () => {
        try {
            const res = await getAllMockInterviews();
            if (res && res.mockInterviews) {
                setMockInterviews(res.mockInterviews);
            }
        } catch (error) {
            console.error('Failed to fetch mock interviews');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!jobDescription.trim()) {
            return toast.error('Job Description is required!');
        }
        if (!selfDescription.trim() && !resumeFile) {
            return toast.error('Please provide either a Resume PDF or a Self Description!');
        }

        const report = await generateReport({ 
            jobDescription, 
            selfDescription, 
            resumeFile,
            role,
            company,
            experienceLevel
        });
        if (report) {
            navigate(`/interview/${report._id}`);
        }
    };

    const handleLogoutClick = async () => {
        try {
            await handleLogout();
            localStorage.clear();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed.');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string, type: 'strategy' | 'mock') => {
        e.stopPropagation();
        
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#e1e7ef', fontSize: '1.1rem' }}>
                    Delete this {type === 'strategy' ? 'strategy' : 'mock interview'}?
                </span>
                <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>This action cannot be undone.</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            if (type === 'strategy') {
                                deleteReport(id);
                            } else if (type === 'mock') {
                                try {
                                    await deleteMockInterview(id);
                                    setMockInterviews(prev => prev.filter(m => m._id !== id));
                                    toast.success('Mock interview deleted.');
                                } catch (error) {
                                    toast.error('Failed to delete mock interview.');
                                }
                            }
                        }}
                        style={{ background: '#da3633', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}
                    >
                        Delete
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        style={{ background: '#30363d', color: '#c9d1d9', border: '1px solid #3c4453', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: { background: '#161b22', border: '1px solid #3c4453' }
        });
    };

    return (
        <div className="home-page">
            <div className="dashboard-header">
                <div className="logo-section">
                    <h1>Interview Intelligence Hub</h1>
                    <p>Elevate your strategy, check match score, and practice mock interviews</p>
                </div>
                
                <button onClick={handleLogoutClick} className="logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
            </div>

            {/* Input strategy generator */}
            <div className="glass-panel generator-panel">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Generate New Strategy
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Job Description (Required) *</label>
                        <textarea 
                            value={jobDescription} 
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            rows={4}
                        />
                    </div>

                    {/* Track Selection Parameters */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Target Role / Focus Track</label>
                            <select 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 14px', borderRadius: '8px', outline: 'none', width: '100%', cursor: 'pointer' }}
                            >
                                <option value="Software Engineer">Software Engineer (General)</option>
                                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                                <option value="AI Architect">AI Architect</option>
                                <option value="DevOps Engineer">DevOps Engineer</option>
                                <option value="Product Manager">Product Manager</option>
                                <option value="Data Analyst">Data Analyst</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Target Company Match</label>
                            <select 
                                value={company} 
                                onChange={(e) => setCompany(e.target.value)}
                                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 14px', borderRadius: '8px', outline: 'none', width: '100%', cursor: 'pointer' }}
                            >
                                <option value="General">General / Standard</option>
                                <option value="Google">Google</option>
                                <option value="Amazon">Amazon</option>
                                <option value="Microsoft">Microsoft</option>
                                <option value="Meta">Meta</option>
                                <option value="Apple">Apple</option>
                                <option value="Netflix">Netflix</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Experience Level</label>
                            <select 
                                value={experienceLevel} 
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 14px', borderRadius: '8px', outline: 'none', width: '100%', cursor: 'pointer' }}
                            >
                                <option value="Junior">Junior (0-2 Yrs)</option>
                                <option value="Mid-Level">Mid-Level (2-5 Yrs)</option>
                                <option value="Senior">Senior (5-8 Yrs)</option>
                                <option value="Staff/Principal">Staff/Principal (8+ Yrs)</option>
                            </select>
                        </div>
                    </div>

                    <div className="split-row">
                        <div className="form-group">
                            <label>Upload Resume (PDF)</label>
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>
                        </div>
                        <div className="or-text">OR</div>
                        <div className="form-group">
                            <label>Quick Self Description</label>
                            <textarea 
                                value={selfDescription} 
                                onChange={(e) => setSelfDescription(e.target.value)}
                                placeholder="I am a React developer with 3 years of experience..."
                                style={{ height: '43px', resize: 'none' }}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="glow-btn"
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {loading ? 'Analyzing Profile & Generating Plan...' : '🚀 Generate Interview Strategy'}
                    </button>
                </form>
            </div>

            {/* Hub tabs */}
            <div>
                <div className="tabs-navigation">
                    <button 
                        onClick={() => setActiveTab('strategies')}
                        className={`tab-btn ${activeTab === 'strategies' ? 'active' : ''}`}
                    >
                        📑 Strategy Reports
                    </button>
                    <button 
                        onClick={() => setActiveTab('mocks')}
                        className={`tab-btn ${activeTab === 'mocks' ? 'active active-mocks' : ''}`}
                    >
                        🎙️ Mock Interviews
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    >
                        📊 Analytics Dashboard
                    </button>
                </div>

                {activeTab === 'strategies' && (
                    <div className="cards-grid">
                        {reports?.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No strategies generated yet.</p> : null}
                        {reports?.map((report) => (
                            <div 
                                key={report._id} 
                                onClick={() => navigate(`/interview/${report._id}`)} 
                                className="glass-panel strategy-card"
                            >
                                <div className="card-header">
                                    <h3>{report.title}</h3>
                                    <span 
                                        className="badge"
                                        style={{ 
                                            background: report.matchScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                                            color: report.matchScore >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                                            border: `1px solid ${report.matchScore >= 80 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` 
                                        }}
                                    >
                                        {report.matchScore}% Match
                                    </span>
                                </div>
                                <div className="card-footer">
                                    <span className="date-text">{new Date(report.createdAt).toLocaleDateString()}</span>
                                    <button 
                                        onClick={(e) => handleDeleteClick(e, report._id, 'strategy')}
                                        className="action-icon"
                                        title="Delete Strategy"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'mocks' && (
                    <div className="cards-grid">
                        {mockInterviews?.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No mock interviews completed yet.</p> : null}
                        {mockInterviews?.map((mock) => (
                            <div 
                                key={mock._id} 
                                onClick={() => navigate('/mock-result', { state: { mock } })} 
                                className="glass-panel mock-card"
                            >
                                <div className="mock-header">
                                    <div>
                                        <h3>{mock.jobTitle}</h3>
                                        <div className="questions-count">{mock.qaList?.length || 0} Questions Answered</div>
                                    </div>
                                    <div className="score-circle">
                                        {mock.totalScore}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <span className="date-text">{new Date(mock.createdAt).toLocaleDateString()}</span>
                                    <button 
                                        onClick={(e) => handleDeleteClick(e, mock._id, 'mock')}
                                        className="action-icon"
                                        title="Delete Mock Interview"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <MockAnalytics />
                )}
            </div>
        </div>
    );
};

export default Home;
