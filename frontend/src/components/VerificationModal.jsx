import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import api from '../api';

/* ── Step constants ──────────────────────────────────────────────────────── */
const STEP = { INTRO: 'intro', LOADING_QUIZ: 'loading_quiz', QUIZ: 'quiz', GRADING: 'grading', SUCCESS: 'success', FAIL: 'fail', ERROR: 'error' };

export default function VerificationModal({ onClose, onVerified }) {
    const [step,      setStep]      = useState(STEP.INTRO);
    const [questions, setQuestions] = useState([]);
    const [answers,   setAnswers]   = useState(['', '', '']);
    const [current,   setCurrent]   = useState(0);   // which question is shown
    const [result,    setResult]    = useState(null); // { score, feedback }
    const [error,     setError]     = useState('');

    /* Generate quiz */
    const startQuiz = async () => {
        setStep(STEP.LOADING_QUIZ);
        try {
            const { data } = await api.post('/trust/generate-quiz');
            setQuestions(data.questions);
            setAnswers(new Array(data.questions.length).fill(''));
            setCurrent(0);
            setStep(STEP.QUIZ);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate quiz');
            setStep(STEP.ERROR);
        }
    };

    /* Submit answers */
    const submitAnswers = async () => {
        if (answers[current].trim().length < 10)
            return; // prevent submit on last step with empty answer
        setStep(STEP.GRADING);
        try {
            const { data } = await api.post('/trust/submit-quiz', { questions, answers });
            setResult({ score: data.score, feedback: data.feedback });
            if (data.status === 'VERIFIED') {
                setStep(STEP.SUCCESS);
                // Update localStorage so badge shows immediately
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, isVerified: true }));
                onVerified && onVerified();
            } else {
                setStep(STEP.FAIL);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Grading failed');
            setStep(STEP.ERROR);
        }
    };

    const nextQuestion = () => {
        if (current < questions.length - 1) setCurrent(c => c + 1);
        else submitAnswers();
    };

    const progress = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

                .vm-overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(15, 10, 40, 0.65);
                    backdrop-filter: blur(6px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .vm-card {
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(255,255,255,0.25);
                    border-radius: 24px;
                    padding: 36px 32px;
                    width: 100%; max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
                    position: relative;
                    background-image: linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%);
                    animation: slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both;
                }
                @keyframes slideUp { from { opacity:0; transform: translateY(24px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }

                .vm-close {
                    position: absolute; top: 16px; right: 18px;
                    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
                    border-radius: 8px; width: 32px; height: 32px;
                    color: rgba(255,255,255,0.8); font-size: 16px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s;
                }
                .vm-close:hover { background: rgba(255,255,255,0.25); }

                .vm-title { font-family: 'Outfit',sans-serif; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.4px; margin-bottom: 6px; }
                .vm-sub   { font-family: 'Outfit',sans-serif; font-size: 14px; color: rgba(255,255,255,0.65); margin-bottom: 24px; line-height: 1.5; }

                .vm-btn {
                    font-family: 'Outfit',sans-serif;
                    font-size: 14px; font-weight: 700;
                    border: none; border-radius: 12px;
                    cursor: pointer; transition: all 0.2s;
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                }
                .vm-btn-primary {
                    background: linear-gradient(135deg,#667eea,#764ba2);
                    color: #fff; padding: 12px 28px;
                    box-shadow: 0 4px 18px rgba(102,126,234,0.45);
                }
                .vm-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(102,126,234,0.6); }
                .vm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                .vm-btn-ghost { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); padding: 10px 20px; }
                .vm-btn-ghost:hover { background: rgba(255,255,255,0.18); }

                .progress-bar-wrap { height: 5px; background: rgba(255,255,255,0.15); border-radius: 99px; margin-bottom: 20px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: linear-gradient(90deg,#667eea,#a78bfa); border-radius: 99px; transition: width 0.4s ease; }

                .q-number { font-family:'Outfit',sans-serif; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; margin-bottom: 8px; text-transform: uppercase; }
                .q-text   { font-family:'Outfit',sans-serif; font-size: 16px; font-weight: 600; color: #fff; line-height: 1.55; margin-bottom: 18px; }

                .vm-textarea {
                    width: 100%; min-height: 110px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.25);
                    border-radius: 12px; padding: 14px 16px;
                    font-size: 14px; font-family: 'Outfit',sans-serif;
                    color: #fff; resize: vertical; outline: none;
                    line-height: 1.55; box-sizing: border-box;
                    transition: border-color 0.2s, background 0.2s;
                }
                .vm-textarea::placeholder { color: rgba(255,255,255,0.35); }
                .vm-textarea:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.15); }

                .char-hint { font-family:'Outfit',sans-serif; font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 6px; text-align: right; }

                /* Success / Fail animations */
                .result-icon { font-size: 56px; text-align: center; margin-bottom: 12px; animation: popIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
                @keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                .feedback-item {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 10px; padding: 10px 14px;
                    font-family:'Outfit',sans-serif; font-size: 13px;
                    color: rgba(255,255,255,0.75); line-height: 1.5;
                    margin-bottom: 8px;
                }

                .score-badge {
                    display: inline-block;
                    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
                    border-radius: 99px; padding: 4px 16px;
                    font-family:'Outfit',sans-serif; font-size: 14px; font-weight: 700; color: #fff;
                    margin-bottom: 16px;
                }

                .step-dots { display: flex; gap: 6px; justify-content: center; margin-top: 20px; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.25); transition: background 0.2s; }
                .dot.active { background: #a78bfa; }
            `}</style>

            <div className="vm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="vm-card">
                    <button className="vm-close" onClick={onClose}>✕</button>

                    {/* ── INTRO ─────────────────────────────────────────── */}
                    {step === STEP.INTRO && (
                        <>
                            <div style={{ fontSize: 44, textAlign: 'center', marginBottom: 12 }}>🛡️</div>
                            <div className="vm-title" style={{ textAlign: 'center' }}>Verify Your Skills</div>
                            <div className="vm-sub" style={{ textAlign: 'center' }}>
                                Our AI will ask you 3 technical questions based on your skills.
                                Answer honestly — a score of 4/6 or above earns a <strong style={{ color: '#a78bfa' }}>Verified ✓</strong> badge on your profile.
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
                                {[['🤖','AI-generated questions tailored to your skills'],['⏱️','~5 minutes to complete'],['🏅','Badge stays permanently on your profile']].map(([icon, text]) => (
                                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                                        <span style={{ fontSize: 18 }}>{icon}</span>{text}
                                    </div>
                                ))}
                            </div>
                            <button className="vm-btn vm-btn-primary" style={{ width: '100%' }} onClick={startQuiz}>
                                Start Verification →
                            </button>
                        </>
                    )}

                    {/* ── LOADING QUIZ ──────────────────────────────────── */}
                    {step === STEP.LOADING_QUIZ && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CircularProgress size={44} sx={{ color: '#a78bfa', mb: 2 }} />
                            <div className="vm-title">Generating Questions…</div>
                            <div className="vm-sub">AI is crafting questions based on your skills</div>
                        </div>
                    )}

                    {/* ── QUIZ ──────────────────────────────────────────── */}
                    {step === STEP.QUIZ && questions.length > 0 && (
                        <>
                            <div className="progress-bar-wrap">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="q-number">Question {current + 1} of {questions.length}</div>
                            <div className="q-text">{questions[current]}</div>

                            <textarea
                                className="vm-textarea"
                                placeholder="Write your answer here… (minimum 10 characters)"
                                value={answers[current]}
                                onChange={e => setAnswers(prev => { const a = [...prev]; a[current] = e.target.value; return a; })}
                            />
                            <div className="char-hint">{answers[current].length} chars</div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'space-between' }}>
                                {current > 0 && (
                                    <button className="vm-btn vm-btn-ghost" onClick={() => setCurrent(c => c - 1)}>← Back</button>
                                )}
                                <button
                                    className="vm-btn vm-btn-primary"
                                    style={{ marginLeft: 'auto' }}
                                    disabled={answers[current].trim().length < 10}
                                    onClick={nextQuestion}
                                >
                                    {current < questions.length - 1 ? 'Next →' : 'Submit Answers →'}
                                </button>
                            </div>

                            <div className="step-dots">
                                {questions.map((_, i) => <div key={i} className={`dot ${i <= current ? 'active' : ''}`} />)}
                            </div>
                        </>
                    )}

                    {/* ── GRADING ───────────────────────────────────────── */}
                    {step === STEP.GRADING && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CircularProgress size={44} sx={{ color: '#a78bfa', mb: 2 }} />
                            <div className="vm-title">Grading Your Answers…</div>
                            <div className="vm-sub">AI is evaluating your responses</div>
                        </div>
                    )}

                    {/* ── SUCCESS ───────────────────────────────────────── */}
                    {step === STEP.SUCCESS && (
                        <>
                            <div className="result-icon">🎉</div>
                            <div className="vm-title" style={{ textAlign: 'center', color: '#86efac' }}>Verified!</div>
                            <div className="vm-sub" style={{ textAlign: 'center' }}>
                                You scored <strong style={{ color: '#fff' }}>{result?.score}/6</strong>. A <strong style={{ color: '#a78bfa' }}>Verified ✓</strong> badge has been added to your profile.
                            </div>
                            {result?.feedback?.map((f, i) => (
                                <div key={i} className="feedback-item">
                                    <span style={{ color: '#86efac', fontWeight: 700 }}>Q{i+1}:</span> {f}
                                </div>
                            ))}
                            <button className="vm-btn vm-btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
                                View My Profile ✓
                            </button>
                        </>
                    )}

                    {/* ── FAIL ──────────────────────────────────────────── */}
                    {step === STEP.FAIL && (
                        <>
                            <div className="result-icon">😔</div>
                            <div className="vm-title" style={{ textAlign: 'center', color: '#fca5a5' }}>Not Verified</div>
                            <div className="vm-sub" style={{ textAlign: 'center' }}>
                                You scored <strong style={{ color: '#fff' }}>{result?.score}/6</strong>. You need 4/6 to pass. Review the feedback below and try again.
                            </div>
                            {result?.feedback?.map((f, i) => (
                                <div key={i} className="feedback-item">
                                    <span style={{ color: '#fca5a5', fontWeight: 700 }}>Q{i+1}:</span> {f}
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button className="vm-btn vm-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
                                <button className="vm-btn vm-btn-primary" style={{ flex: 1 }} onClick={() => { setStep(STEP.INTRO); setAnswers(['','','']); setCurrent(0); }}>Try Again</button>
                            </div>
                        </>
                    )}

                    {/* ── ERROR ─────────────────────────────────────────── */}
                    {step === STEP.ERROR && (
                        <>
                            <div className="result-icon">⚠️</div>
                            <div className="vm-title" style={{ textAlign: 'center' }}>Something went wrong</div>
                            <div className="vm-sub" style={{ textAlign: 'center' }}>{error}</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="vm-btn vm-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
                                <button className="vm-btn vm-btn-primary" style={{ flex: 1 }} onClick={() => setStep(STEP.INTRO)}>Try Again</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}