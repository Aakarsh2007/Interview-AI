import React, { useState, useEffect } from 'react';
import '../style/interview.scss';
import { useInterview } from '../hooks/useInterview';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';

interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'docs' | 'practice';
}

interface Task {
  text: string;
  resources: Resource[];
}

interface PreparationDay {
  day: number;
  focus: string;
  tasks: (string | Task)[];
}

interface TechnicalQuestion {
  question: string;
  intention: string;
  answer: string;
}

interface SkillGap {
  skill: string;
  severity: 'low' | 'medium' | 'high';
}

interface Report {
  _id: string;
  title: string;
  matchScore: number;
  technicalQuestions: TechnicalQuestion[];
  behavioralQuestions: TechnicalQuestion[];
  skillGaps: SkillGap[];
  preparationPlan: PreparationDay[];
  completedTasks: string[];
  atsKeywordsMissing?: string[];
  atsSuggestedBullets?: string[];
}

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
    { id: 'ats', label: 'ATS Resume Optimizer', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>) },
];

interface QuestionCardProps {
  item: TechnicalQuestion;
  index: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ item, index }) => {
    const [ open, setOpen ] = useState(false);
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`} style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div className='q-card__header' style={{ padding: '1.5rem', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className='q-card__index' style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '2px', background: 'rgba(255, 45, 120, 0.1)', border: '1px solid rgba(255, 45, 120, 0.2)' }}>Q{index + 1}</span>
                    <div style={{ flex: 1 }}>
                        <p className='q-card__question' style={{ fontSize: '1.05rem', lineHeight: '1.5', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>{item.question}</p>
                        <button 
                            onClick={() => setOpen(!open)}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all var(--transition-fast)' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            {open ? 'Hide Answer' : 'View Suggested Answer'}
                        </button>
                    </div>
                </div>
            </div>
            {open && (
                <div className='q-card__body' style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                    <div className='q-card__section' style={{ marginBottom: '1.5rem' }}>
                        <span className='q-card__tag q-card__tag--intention' style={{ display: 'inline-block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', marginBottom: '0.5rem', fontWeight: 'bold', background: 'rgba(143, 68, 253, 0.1)', border: '1px solid rgba(143, 68, 253, 0.2)' }}>Interviewer Intention</span>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer' style={{ display: 'inline-block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-emerald)', marginBottom: '0.5rem', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>How to Answer</span>
                        <p style={{ color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

interface RoadMapDayProps {
  day: PreparationDay;
  completedTasks: string[];
  onToggleTask: (id: string, taskString: string) => void;
  reportId: string;
}

const RoadMapDay: React.FC<RoadMapDayProps> = ({ day, completedTasks, onToggleTask, reportId }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks' style={{ listStyle: 'none', padding: 0 }}>
            {day.tasks.map((task, i) => {
                const taskText = typeof task === 'string' ? task : task.text;
                const resources = typeof task === 'string' ? [] : task.resources || [];
                const isCompleted = completedTasks?.includes(taskText);

                return (
                    <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                        <div 
                            onClick={() => onToggleTask(reportId, taskText)} 
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: isCompleted ? 'var(--text-dark)' : 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none', transition: 'all var(--transition-fast)' }}
                        >
                            <div style={{ minWidth: '18px', height: '18px', marginTop: '3px', border: `2px solid ${isCompleted ? 'var(--accent-emerald)' : 'var(--text-dark)'}`, borderRadius: '4px', background: isCompleted ? 'var(--accent-emerald)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <span style={{ flex: 1, lineHeight: '1.5', fontSize: '0.9rem' }}>{taskText}</span>
                        </div>

                        {resources.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', paddingLeft: '30px' }}>
                                {resources.map((res, idx) => {
                                    let icon = '📖';
                                    if (res.type === 'video') icon = '🎥';
                                    if (res.type === 'practice') icon = '💻';
                                    if (res.type === 'article') icon = '📰';
                                    
                                    return (
                                        <a 
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} 
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid var(--border-color)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                color: 'var(--accent-primary)',
                                                textDecoration: 'none',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(143, 68, 253, 0.1)';
                                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                            }}
                                        >
                                            <span>{icon}</span> {res.title}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    </div>
);

const Interview: React.FC = () => {
    const [ activeNav, setActiveNav ] = useState<'technical' | 'behavioral' | 'roadmap' | 'ats'>('technical');
    const { report, getReportById, loading, getResumePdf, toggleTask } = useInterview();
    const { interviewId } = useParams<{ interviewId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        }
    }, [ interviewId ]);

    if (loading || !report) return <div style={{color: "white", padding: "2rem", textAlign: "center"}}>Loading Report...</div>;

    const typedReport = report as Report;
    const scoreColor = typedReport.matchScore >= 80 ? 'score--high' : typedReport.matchScore >= 60 ? 'score--mid' : 'score--low';

    const totalTasks = typedReport.preparationPlan?.reduce((acc, day) => acc + day.tasks.length, 0) || 0;
    const completedTasksCount = typedReport.completedTasks?.length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const missingKeywords = typedReport.atsKeywordsMissing || [];
    const suggestedBullets = typedReport.atsSuggestedBullets || [];

    return (
        <div className='interview-page'>
            <div className='interview-layout glass-panel'>
                
                <nav className='interview-nav' style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back to Dashboard
                        </button>
                    </div>
                    
                    <div className="nav-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '0.5rem' }}>
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button key={item.id} className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`} onClick={() => setActiveNav(item.id as any)}>
                                <span className='interview-nav__icon'>{item.icon}</span> {item.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => { getResumePdf(interviewId!) }} className='glow-btn' style={{ marginTop: 'auto', width: '100%', fontSize: '0.85rem', padding: '10px' }} >
                        <svg height={"1rem"} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                        Download Resume
                    </button>
                </nav>

                <div className='interview-divider' />

                <div className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{typedReport.technicalQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {typedReport.technicalQuestions?.map((q, i) => <QuestionCard key={i} item={q} index={i} />)}
                            </div>
                        </section>
                    )}
                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{typedReport.behavioralQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {typedReport.behavioralQuestions?.map((q, i) => <QuestionCard key={i} item={q} index={i} />)}
                            </div>
                        </section>
                    )}
                    {activeNav === 'roadmap' && (
                        <section>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Preparation Road Map</h2>
                                    <span className='content-header__count'>{typedReport.preparationPlan?.length || 0}-day plan</span>
                                </div>
                                
                                <div style={{ width: '100%', background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Overall Progress</span>
                                        <span style={{ color: progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)', fontWeight: 800, fontSize: '1.1rem' }}>
                                            {progressPercent}%
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${progressPercent}%`, 
                                            height: '100%', 
                                            background: progressPercent === 100 ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', 
                                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: progressPercent === 100 ? 'none' : '0 0 8px var(--accent-primary)'
                                        }}></div>
                                    </div>
                                    <p style={{ margin: '0.8rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-dark)', textAlign: 'right' }}>
                                        {completedTasksCount} of {totalTasks} tasks completed
                                    </p>
                                </div>
                            </div>

                            <div className='roadmap-list'>
                                {typedReport.preparationPlan?.map((day) => (
                                    <RoadMapDay 
                                        key={day.day} 
                                        day={day} 
                                        completedTasks={typedReport.completedTasks} 
                                        onToggleTask={toggleTask} 
                                        reportId={typedReport._id} 
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                    {activeNav === 'ats' && (
                        <section>
                            <div className='content-header'>
                                <h2>ATS Resume Optimizer</h2>
                                <span className='content-header__count'>Resume refinement</span>
                            </div>
                            
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Optimize your resume for Applicant Tracking Systems (ATS). We parsed the job description and compared it with your resume context to locate missing keywords and suggest high-impact action bullets.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Missing Keywords */}
                                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-secondary)' }}>⚠️ Critical Missing Keywords</h3>
                                    {missingKeywords.length === 0 ? (
                                        <p style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', margin: 0 }}>Excellent! No major missing keywords detected from the job description context.</p>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {missingKeywords.map((kw, i) => (
                                                <span 
                                                    key={i} 
                                                    style={{ 
                                                        background: 'rgba(255, 45, 120, 0.1)', 
                                                        border: '1px solid rgba(255, 45, 120, 0.25)', 
                                                        color: 'var(--accent-secondary)', 
                                                        padding: '6px 12px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 600,
                                                        boxShadow: '0 0 8px rgba(255, 45, 120, 0.05)'
                                                    }}
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Suggested Bullets */}
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>🎯 Suggested Resume Bullets (Google X-Y-Z Formula)</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
                                        Inject these tailored metrics and accomplishment statements into your experiences to bypass screening software filters:
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {suggestedBullets.length === 0 ? (
                                            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dark)' }}>
                                                No suggested bullets generated for older profiles. Generate a new report to unlock.
                                            </div>
                                        ) : (
                                            suggestedBullets.map((bullet, i) => (
                                                <div 
                                                    key={i} 
                                                    className="glass-panel" 
                                                    style={{ 
                                                        padding: '1.25rem', 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center', 
                                                        gap: '1.5rem',
                                                        borderLeft: '4px solid var(--accent-primary)'
                                                    }}
                                                >
                                                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>{bullet}</p>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(bullet);
                                                            toast.success("Copied to clipboard!");
                                                        }}
                                                        style={{ 
                                                            background: 'rgba(255,255,255,0.05)', 
                                                            border: '1px solid var(--border-color)', 
                                                            color: 'var(--text-muted)', 
                                                            padding: '8px 12px', 
                                                            borderRadius: '8px', 
                                                            cursor: 'pointer', 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: 600,
                                                            whiteSpace: 'nowrap',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                                    >
                                                        Copy Bullet
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <div className='interview-divider' />

                <aside className='interview-sidebar'>
                    <button
                        onClick={() => navigate(`/mock-interview/${typedReport._id}`)} 
                        style={{ width: '100%', padding: '12px', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(255, 45, 120, 0.2)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 45, 120, 0.35)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 45, 120, 0.2)'; }}
                    >
                        🎙️ Start Mock Interview
                    </button>
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{typedReport.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Based on Job Description</p>
                    </div>
                    <div className='sidebar-divider' />
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {typedReport.skillGaps?.map((gap, i) => <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>{gap.skill}</span>)}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Interview;
