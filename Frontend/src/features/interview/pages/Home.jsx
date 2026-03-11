import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js' 
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast' // <-- NEW IMPORT FOR TOASTS

const Home = () => {

    const { loading, generateReport, reports, deleteReport } = useInterview()
    const { handleLogout, user } = useAuth() 
    
    // FAANG FEATURE: Initialize state from LocalStorage so data survives page refreshes!
    const [ jobDescription, setJobDescription ] = useState(() => localStorage.getItem("jobDescription") || "")
    const [ selfDescription, setSelfDescription ] = useState(() => localStorage.getItem("selfDescription") || "")
    const [ fileName, setFileName ] = useState("") 
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    // Auto-Save whenever the user types
    useEffect(() => {
        localStorage.setItem("jobDescription", jobDescription);
    }, [jobDescription]);

    useEffect(() => {
        localStorage.setItem("selfDescription", selfDescription);
    }, [selfDescription]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) setFileName(file.name);
    }

    const handleGenerateReport = async () => {
        // Validation Guards with sleek Toasts instead of alerts
        if (!jobDescription) {
            toast.error("Please paste a Target Job Description!");
            return;
        }
        if (!selfDescription && !resumeInputRef.current?.files[0]) {
            toast.error("Please provide either a Resume or a Quick Self-Description!");
            return;
        }

        const resumeFile = resumeInputRef.current?.files[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        
        // Only navigate if it successfully returned data
        if(data && data._id){
            navigate(`/interview/${data._id}`)
        }
    }

    const handleDelete = (e, id) => {
        e.stopPropagation(); // Prevents the card click from triggering navigation
        if(window.confirm("Are you sure you want to permanently delete this report?")) {
            deleteReport(id);
        }
    }

    // NEW FAANG SKELETON LOADER
    if (loading) {
        return (
            <div className='home-page' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
                <div className="skeleton" style={{ height: '40px', width: '350px', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '500px', marginBottom: '3rem' }}></div>
                
                <div className='interview-card' style={{ width: '100%', maxWidth: '900px', border: 'none', background: 'transparent' }}>
                    <div className='interview-card__body' style={{ gap: '2rem', padding: 0 }}>
                        <div className="skeleton" style={{ height: '350px', flex: 1 }}></div>
                        <div className="skeleton" style={{ height: '350px', flex: 1 }}></div>
                    </div>
                </div>
                <h3 style={{ color: '#8b949e', marginTop: '2rem' }}>AI is analyzing your profile... (Approx 20s)</h3>
            </div>
        )
    }

    return (
        <div className='home-page'>
            
            {/* Navbar with User info and Logout */}
            <nav style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', marginBottom: '-1rem' }}>
                <span style={{ color: '#7d8590', fontSize: '0.9rem' }}>Welcome, <strong style={{color: 'white'}}>{user?.username}</strong></span>
                <button onClick={handleLogout} className='button primary-button' style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    Logout
                </button>
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription} // Bind value to state for auto-save
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                </span>
                                {/* Dynamic File Name */}
                                <p className='dropzone__title'>
                                    {fileName ? <span style={{color: '#ff2d78'}}>{fileName}</span> : "Click to upload or drag & drop"}
                                </p>
                                <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                <input onChange={handleFileChange} ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf,.docx' />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription} // Bind value to state for auto-save
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' style={{ position: 'relative' }} onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                                
                                {/* DELETE BUTTON */}
                                <button 
                                    onClick={(e) => handleDelete(e, report._id)}
                                    style={{
                                        position: 'absolute', top: '15px', right: '15px', background: 'transparent', 
                                        border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px'
                                    }}
                                    title="Delete Report"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home