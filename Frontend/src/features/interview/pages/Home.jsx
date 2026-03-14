import React, { useState, useEffect } from 'react';
import { useInterview } from '../hooks/useInterview';
import { getAllMockInterviews, deleteMockInterview } from '../services/interview.api';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const Home = () => {
    const { generateReport, reports, getReports, loading, deleteReport } = useInterview();
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [resumeFile, setResumeFile] = useState(null);

    const [activeTab, setActiveTab] = useState('strategies');
    const [mockInterviews, setMockInterviews] = useState([]);

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
            console.error("Failed to fetch mock interviews");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!jobDescription.trim()) {
            return toast.error("Job Description is required!");
        }
        if (!selfDescription.trim() && !resumeFile) {
            return toast.error("Please provide either a Resume PDF or a Self Description!");
        }

        const report = await generateReport({ jobDescription, selfDescription, resumeFile });
        if (report) {
            navigate(`/interview/${report._id}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate('/login');
    };

    const handleDeleteClick = (e, id, type) => {
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
                                    toast.success("Mock interview deleted.");
                                } catch (error) {
                                    toast.error("Failed to delete mock interview.");
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', color: '#e1e7ef', fontFamily: 'system-ui, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>Interview Intelligence Hub</h1>
                
                <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: '1px solid #da3633', color: '#da3633', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#da3633'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#da3633'; }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
            </div>

            <div style={{ background: '#14171c', padding: '2rem', borderRadius: '12px', border: '1px solid #3c4453', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#58a6ff' }}>Generate New Strategy</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#a0aab8' }}>Job Description (Required) *</label>
                        <textarea 
                            value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            style={{ width: '100%', height: '100px', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '1rem', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#a0aab8' }}>Upload Resume (PDF)</label>
                            <input 
                                type="file" accept="application/pdf"
                                onChange={(e) => setResumeFile(e.target.files[0])}
                                style={{ width: '100%', padding: '0.8rem', background: '#0d1117', border: '1px dashed #30363d', borderRadius: '8px', color: '#8b949e', cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ padding: '1.5rem 0', color: '#8b949e', fontWeight: 'bold' }}>OR</div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#a0aab8' }}>Quick Self Description</label>
                            <textarea 
                                value={selfDescription} onChange={(e) => setSelfDescription(e.target.value)}
                                placeholder="I am a React developer with 3 years of experience..."
                                style={{ width: '100%', height: '55px', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '0.8rem', borderRadius: '8px', resize: 'none' }}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        style={{ background: loading ? '#4d5562' : '#238636', color: 'white', padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem', transition: 'background 0.2s' }}
                    >
                        {loading ? 'Analyzing Profile & Generating Plan...' : '🚀 Generate Interview Strategy'}
                    </button>
                </form>
            </div>

            <div>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #3c4453', marginBottom: '2rem' }}>
                    <button 
                        onClick={() => setActiveTab('strategies')}
                        style={{ background: 'transparent', border: 'none', padding: '1rem 2rem', color: activeTab === 'strategies' ? '#58a6ff' : '#8b949e', borderBottom: activeTab === 'strategies' ? '3px solid #58a6ff' : '3px solid transparent', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        📑 Strategy Reports
                    </button>
                    <button 
                        onClick={() => setActiveTab('mocks')}
                        style={{ background: 'transparent', border: 'none', padding: '1rem 2rem', color: activeTab === 'mocks' ? '#ff2d78' : '#8b949e', borderBottom: activeTab === 'mocks' ? '3px solid #ff2d78' : '3px solid transparent', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        🎙️ Mock Interviews
                    </button>
                </div>

                {activeTab === 'strategies' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {reports?.length === 0 ? <p style={{ color: '#8b949e' }}>No strategies generated yet.</p> : null}
                        {reports?.map((report) => (
                            <div key={report._id} onClick={() => navigate(`/interview/${report._id}`)} style={{ background: '#14171c', border: '1px solid #3c4453', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#e1e7ef', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: '10px' }}>{report.title}</h3>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ background: report.matchScore >= 80 ? 'rgba(63, 185, 80, 0.2)' : 'rgba(210, 153, 34, 0.2)', color: report.matchScore >= 80 ? '#3fb950' : '#d29922', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                            {report.matchScore}%
                                        </span>
                                        
                                        <button 
                                            onClick={(e) => handleDeleteClick(e, report._id, 'strategy')}
                                            style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = '#da3633'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#8b949e'}
                                            title="Delete Strategy"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <span style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: 'auto' }}>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'mocks' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {mockInterviews?.length === 0 ? <p style={{ color: '#8b949e' }}>No mock interviews completed yet.</p> : null}
                        
                        {mockInterviews?.map((mock) => (
                            <div 
                                key={mock._id} 
                                onClick={() => navigate('/mock-result', { state: { mock } })} 
                                style={{ background: '#14171c', border: '1px solid #3c4453', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#e1e7ef', paddingRight: '10px' }}>{mock.jobTitle}</h3>
                                        <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>{mock.qaList?.length || 0} Questions Answered</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: mock.totalScore >= 70 ? 'rgba(63, 185, 80, 0.2)' : 'rgba(210, 153, 34, 0.2)', color: mock.totalScore >= 70 ? '#3fb950' : '#d29922', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', border: `2px solid ${mock.totalScore >= 70 ? '#3fb950' : '#d29922'}` }}>
                                            {mock.totalScore}
                                        </div>

                                        <button 
                                            onClick={(e) => handleDeleteClick(e, mock._id, 'mock')}
                                            style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = '#da3633'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#8b949e'}
                                            title="Delete Mock Interview"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <span style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: 'auto' }}>{new Date(mock.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;