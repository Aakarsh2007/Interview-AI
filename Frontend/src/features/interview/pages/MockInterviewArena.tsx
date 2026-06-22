import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useInterview } from '../hooks/useInterview';
import toast from 'react-hot-toast';

interface Question {
  question: string;
}

interface Report {
  _id: string;
  title: string;
  technicalQuestions: Question[];
  behavioralQuestions: Question[];
}

const MockInterviewArena: React.FC = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const navigate = useNavigate();
    const { report, getReportById, evaluateAnswer, submitMockInterview, loading } = useInterview();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState<{ score: number; feedback: string } | null>(null); 
    const [qaHistory, setQaHistory] = useState<any[]>([]);

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Audio & Settings
    const [voiceRate, setVoiceRate] = useState(0.95);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Timer Settings
    const [timerConfig, setTimerConfig] = useState<number | 'off'>(90);
    const [timeLeft, setTimeLeft] = useState(90);

    // Delivery Analytics Refs
    const recordStartRef = useRef<number | null>(null);
    const currentDurationRef = useRef<number>(0);
    const isSpokenRef = useRef<boolean>(false);

    useEffect(() => {
        if (!report && interviewId) {
            getReportById(interviewId);
        }
    }, [interviewId]);

    useEffect(() => {
        if (report) {
            const typedReport = report as Report;
            if (typedReport.technicalQuestions && typedReport.behavioralQuestions) {
                const combined = [...typedReport.technicalQuestions, ...typedReport.behavioralQuestions];
                const shuffled = combined.sort(() => 0.5 - Math.random());
                setQuestions(shuffled.slice(0, 5));
            }
        }
    }, [report]);

    // Load Web Speech Synthesis Voices
    useEffect(() => {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Text to Speech Effect
    useEffect(() => {
        if (questions.length > 0 && !currentFeedback && !isPaused) {
            const currentQuestionText = questions[currentIndex].question;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(currentQuestionText);
                utterance.rate = voiceRate;
                if (selectedVoiceName) {
                    const voice = availableVoices.find(v => v.name === selectedVoiceName);
                    if (voice) utterance.voice = voice;
                }
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [currentIndex, questions, currentFeedback, voiceRate, selectedVoiceName, availableVoices, isPaused]);

    // Timer Effect
    useEffect(() => {
        if (timerConfig === 'off' || currentFeedback || isPaused) return;

        setTimeLeft(timerConfig);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error("Time is up! auto-evaluating response.");
                    handleTimeoutSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, currentFeedback, timerConfig, isPaused]);

    // Speech Recognition Setup
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setUserAnswer((prev) => prev + " " + currentTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (recordStartRef.current) {
                currentDurationRef.current = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
            }
        } else {
            setUserAnswer(''); 
            isSpokenRef.current = true;
            recordStartRef.current = Date.now();
            recognitionRef.current?.start();
            setIsRecording(true);
            toast.success("Listening... Speak your answer!");
        }
    };

    const handleEvaluate = async () => {
        if (userAnswer.trim().length < 5) return toast.error("Answer too short.");
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (recordStartRef.current) {
                currentDurationRef.current = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
            }
        }

        setIsEvaluating(true);
        const currentQ = questions[currentIndex].question;
        const typedReport = report as Report;
        
        const evaluation = await evaluateAnswer({
            question: currentQ,
            userAnswer: userAnswer,
            jobTitle: typedReport.title
        });

        if (evaluation) {
            setCurrentFeedback(evaluation);
            setQaHistory(prev => [...prev, {
                question: currentQ, 
                userAnswer: userAnswer, 
                aiFeedback: evaluation.feedback, 
                score: evaluation.score,
                durationSeconds: isSpokenRef.current ? currentDurationRef.current : undefined,
                isSpoken: isSpokenRef.current
            }]);
        }
        setIsEvaluating(false);
    };

    const handleTimeoutSubmit = async () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (recordStartRef.current) {
                currentDurationRef.current = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
            }
        }

        setIsEvaluating(true);
        const currentQ = questions[currentIndex].question;
        const typedReport = report as Report;

        const finalAns = userAnswer.trim().length >= 5 ? userAnswer : "No detailed answer recorded before timeout.";

        const evaluation = await evaluateAnswer({
            question: currentQ,
            userAnswer: finalAns,
            jobTitle: typedReport.title
        });

        if (evaluation) {
            setCurrentFeedback(evaluation);
            setQaHistory(prev => [...prev, {
                question: currentQ, 
                userAnswer: finalAns, 
                aiFeedback: evaluation.feedback, 
                score: evaluation.score,
                durationSeconds: isSpokenRef.current ? currentDurationRef.current : undefined,
                isSpoken: isSpokenRef.current
            }]);
        }
        setIsEvaluating(false);
    };

    const handleNextQuestion = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setCurrentFeedback(null);
            // Reset delivery analytics refs
            isSpokenRef.current = false;
            currentDurationRef.current = 0;
            recordStartRef.current = null;
        } else {
            const typedReport = report as Report;
            const totalScore = Math.round(qaHistory.reduce((acc, curr) => acc + curr.score, 0) / qaHistory.length * 10); 
            const savedReport = await submitMockInterview({
                interviewReportId: typedReport._id, jobTitle: typedReport.title, qaList: qaHistory, totalScore: totalScore
            });
            if (savedReport) navigate('/');
        }
    };

    const countFillerWords = (text: string) => {
        const matches = text.match(/\b(um|uh|like|ah|you know|so|actually)\b/gi);
        return matches ? matches.length : 0;
    };

    const calculateWpm = (text: string, seconds: number) => {
        if (!seconds || seconds <= 0) return 0;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        return Math.round((words / seconds) * 60);
    };

    if (loading || questions.length === 0) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading Arena...</div>;

    const isLastQuestion = currentIndex === questions.length - 1;
    const fillerCount = countFillerWords(userAnswer);
    const spokenWpm = calculateWpm(userAnswer, currentDurationRef.current);

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem 2rem', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
            
            {/* Arena Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mock Interview Arena</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Speaking skills practice arena powered by Gemini AI</p>
                </div>
                <span className="glass-panel" style={{ padding: '8px 16px', borderRadius: '12px', fontWeight: 700, color: 'var(--accent-primary)', border: '1px solid var(--border-color)' }}>
                    Q {currentIndex + 1} / {questions.length}
                </span>
            </div>

            {/* Config & Settings Control Drawer */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Voice Selection */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Accent:</span>
                    <select 
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}
                    >
                        <option value="">Default AI Voice</option>
                        {availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                        ))}
                    </select>
                </div>

                {/* Voice Speed */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Rate: {voiceRate}x</span>
                    <input 
                        type="range" 
                        min="0.8" 
                        max="1.2" 
                        step="0.05"
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                    />
                </div>

                {/* Timer Config */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Timer:</span>
                    <select 
                        value={timerConfig}
                        onChange={(e) => setTimerConfig(e.target.value === 'off' ? 'off' : parseInt(e.target.value))}
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}
                    >
                        <option value="60">60s</option>
                        <option value="90">90s</option>
                        <option value="120">120s</option>
                        <option value="off">Off</option>
                    </select>
                </div>

                {/* Pause Button */}
                <button 
                    onClick={() => {
                        setIsPaused(!isPaused);
                        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    }}
                    style={{ background: isPaused ? 'var(--accent-amber)' : 'rgba(255,255,255,0.05)', color: isPaused ? 'white' : 'var(--text-main)', border: `1px solid ${isPaused ? 'var(--accent-amber)' : 'var(--border-color)'}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                    {isPaused ? '▶️ Resume Round' : '⏸️ Pause Round'}
                </button>
            </div>

            {/* Live Question Card */}
            <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                
                {/* Timer Progress Indicator */}
                {timerConfig !== 'off' && !currentFeedback && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{
                            height: '100%',
                            width: `${(timeLeft / (timerConfig as number)) * 100}%`,
                            background: timeLeft < 15 ? 'var(--accent-rose)' : 'var(--accent-primary)',
                            transition: 'width 1s linear',
                            boxShadow: '0 0 6px var(--accent-primary)'
                        }}></div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255, 45, 120, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        ACTIVE QUESTION
                    </span>
                    {timerConfig !== 'off' && !currentFeedback && (
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: timeLeft < 15 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                            ⏱️ {timeLeft}s left
                        </span>
                    )}
                </div>

                <h2 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '2rem', lineHeight: '1.45', fontWeight: 600 }}>
                    {questions[currentIndex].question}
                </h2>

                {isPaused ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <h2>Round Paused</h2>
                        <p style={{ marginTop: '0.5rem' }}>Click "Resume Round" to continue your mock session.</p>
                    </div>
                ) : (
                    <>
                        {!currentFeedback && (
                            <>
                                <textarea
                                    value={userAnswer} 
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your answer details here, or click 'Record Answer' to speak natively..."
                                    style={{ width: '100%', height: '180px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', lineHeight: '1.6', resize: 'vertical', marginBottom: '1.5rem', outline: 'none' }}
                                />

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        onClick={toggleRecording} 
                                        style={{ flex: 1, padding: '14px', background: isRecording ? 'var(--accent-rose)' : 'var(--accent-emerald)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
                                    >
                                        {isRecording ? '🛑 Stop Recording' : '🎙️ Record Answer'}
                                    </button>
                                    <button 
                                        onClick={handleEvaluate} 
                                        disabled={isEvaluating || userAnswer.trim().length === 0} 
                                        className="glow-btn"
                                        style={{ flex: 1, padding: '14px' }}
                                    >
                                        {isEvaluating ? 'Evaluating answer...' : 'Submit Answer'}
                                    </button>
                                </div>
                            </>
                        )}

                        {currentFeedback && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                                
                                {/* Core Scorecard */}
                                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div style={{ 
                                            fontSize: '1.8rem', 
                                            fontWeight: 800, 
                                            color: currentFeedback.score >= 7 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                                            border: `3.5px solid ${currentFeedback.score >= 7 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)'
                                        }}>
                                            {currentFeedback.score}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#e1e7ef', fontSize: '1.1rem', fontWeight: 700 }}>AI Evaluation Sheet</h3>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time score out of 10</p>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.9rem', margin: 0 }}>{currentFeedback.feedback}</p>
                                </div>

                                {/* Speech Delivery Analytics Widget */}
                                {isSpokenRef.current && currentDurationRef.current > 0 && (
                                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', textAlign: 'center' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Speaking Time</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{currentDurationRef.current}s</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Pacing (WPM)</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: spokenWpm >= 110 && spokenWpm <= 150 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{spokenWpm} WPM</span>
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '2px' }}>
                                                {spokenWpm >= 110 && spokenWpm <= 150 ? 'Perfect Pace' : spokenWpm > 150 ? 'Too Fast' : 'Too Slow'}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Filler Words</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: fillerCount > 3 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{fillerCount}</span>
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '2px' }}>
                                                {fillerCount > 3 ? 'Try to reduce' : 'Excellent clarity'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleNextQuestion} 
                                    className="glow-btn"
                                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                                >
                                    {isLastQuestion ? '💾 Finish & Save Mock Results' : 'Next Question ➡️'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MockInterviewArena;
