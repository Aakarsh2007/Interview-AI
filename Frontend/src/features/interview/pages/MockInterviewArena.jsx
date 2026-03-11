import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useInterview } from '../hooks/useInterview';
import toast from 'react-hot-toast';

const MockInterviewArena = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { report, getReportById, evaluateAnswer, submitMockInterview, loading } = useInterview();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState(null); 
    const [qaHistory, setQaHistory] = useState([]);

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!report && interviewId) {
            getReportById(interviewId);
        }
    }, [interviewId]);

    // 🔥 UPDATE: Mix 5 Technical and Behavioral questions randomly!
    useEffect(() => {
        if (report && report.technicalQuestions && report.behavioralQuestions) {
            // 1. Combine both arrays
            const combined = [...report.technicalQuestions, ...report.behavioralQuestions];
            
            // 2. Shuffle them randomly
            const shuffled = combined.sort(() => 0.5 - Math.random());
            
            // 3. Take exactly 5 mixed questions for the arena
            setQuestions(shuffled.slice(0, 5));
        }
    }, [report]);

    // 🔥 FAANG UX: TEXT-TO-SPEECH (AI Reads the Question)
    useEffect(() => {
        if (questions.length > 0 && !currentFeedback) {
            const currentQuestionText = questions[currentIndex].question;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop any previous speech
                const utterance = new SpeechSynthesisUtterance(currentQuestionText);
                utterance.rate = 0.95; // Slightly professional pace
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [currentIndex, questions, currentFeedback]);

    // Speech-To-Text (User dictates answer)
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setUserAnswer((prev) => prev + " " + currentTranscript);
            };

            recognition.onerror = (event) => {
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
        } else {
            setUserAnswer(''); 
            recognitionRef.current?.start();
            setIsRecording(true);
            toast.success("Listening... Speak your answer!");
        }
    };

    const handleEvaluate = async () => {
        if (userAnswer.trim().length < 5) return toast.error("Answer too short.");
        if (isRecording) toggleRecording(); 

        setIsEvaluating(true);
        const currentQ = questions[currentIndex].question;
        
        const evaluation = await evaluateAnswer({
            question: currentQ,
            userAnswer: userAnswer,
            jobTitle: report.title
        });

        if (evaluation) {
            setCurrentFeedback(evaluation);
            setQaHistory(prev => [...prev, {
                question: currentQ, userAnswer: userAnswer, aiFeedback: evaluation.feedback, score: evaluation.score
            }]);
        }
        setIsEvaluating(false);
    };

    const handleNextQuestion = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setCurrentFeedback(null);
        } else {
            const totalScore = Math.round(qaHistory.reduce((acc, curr) => acc + curr.score, 0) / qaHistory.length * 10); 
            const savedReport = await submitMockInterview({
                interviewReportId: report._id, jobTitle: report.title, qaList: qaHistory, totalScore: totalScore
            });
            if (savedReport) navigate('/');
        }
    };

    if (loading || questions.length === 0) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading Arena...</div>;

    const isLastQuestion = currentIndex === questions.length - 1;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', color: '#e1e7ef', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Live Mock Interview</h1>
                <span style={{ background: '#1a1d24', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', color: '#58a6ff' }}>
                    Question {currentIndex + 1} of {questions.length}
                </span>
            </div>

            <div style={{ background: '#14171c', border: '1px solid #3c4453', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    {questions[currentIndex].question}
                </h2>

                {!currentFeedback && (
                    <>
                        <textarea
                            value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here, or click the microphone to speak..."
                            style={{ width: '100%', height: '150px', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '1rem', borderRadius: '8px', fontSize: '1rem', lineHeight: '1.5', resize: 'vertical', marginBottom: '1rem' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={toggleRecording} style={{ flex: 1, padding: '12px', background: isRecording ? '#da3633' : '#238636', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {isRecording ? '🛑 Stop Recording' : '🎙️ Record Answer'}
                            </button>
                            <button onClick={handleEvaluate} disabled={isEvaluating || userAnswer.length === 0} style={{ flex: 1, padding: '12px', background: isEvaluating ? '#4d5562' : '#1f6feb', color: 'white', border: 'none', borderRadius: '8px', cursor: isEvaluating ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                                {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                            </button>
                        </div>
                    </>
                )}

                {currentFeedback && (
                    <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: currentFeedback.score >= 7 ? '#3fb950' : '#d29922' }}>{currentFeedback.score}/10</div>
                            <h3 style={{ margin: 0, color: '#e1e7ef' }}>AI Evaluation</h3>
                        </div>
                        <p style={{ color: '#8b949e', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>{currentFeedback.feedback}</p>
                        <button onClick={handleNextQuestion} style={{ width: '100%', padding: '12px', background: '#1f6feb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {isLastQuestion ? '💾 Finish & Save Interview' : 'Next Question ➡️'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterviewArena;