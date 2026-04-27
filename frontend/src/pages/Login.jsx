import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import api from '../api';

export default function Login() {
    const [form,     setForm]     = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const navigate = useNavigate();

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async () => {
        setError('');
        if (!form.email || !form.password) return setError('Please fill in all fields');
        setLoading(true);
        try {
            const { data } = await api.post('/users/login', form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user',  JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #667eea);
                    background-size: 400% 400%;
                    animation: gradientShift 12s ease infinite;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                }

                @keyframes gradientShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Floating orbs */
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    opacity: 0.35;
                    animation: float 8s ease-in-out infinite;
                    pointer-events: none;
                }
                .orb1 { width: 400px; height: 400px; background: #a78bfa; top: -100px; left: -100px; animation-delay: 0s; }
                .orb2 { width: 300px; height: 300px; background: #f0abfc; bottom: -80px; right: -80px; animation-delay: 3s; }
                .orb3 { width: 200px; height: 200px; background: #667eea; top: 50%; left: 60%; animation-delay: 6s; }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50%       { transform: translateY(-30px) scale(1.05); }
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    border-radius: 24px;
                    padding: 44px 40px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5);
                    position: relative;
                    z-index: 1;
                    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
                }

                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(30px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0)    scale(1); }
                }

                .logo-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 28px;
                }

                .logo-icon {
                    width: 40px; height: 40px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px;
                    box-shadow: 0 4px 14px rgba(102,126,234,0.5);
                }

                .logo-text {
                    font-size: 22px; font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.5px;
                }

                .card-title {
                    font-size: 28px; font-weight: 800;
                    color: #fff; letter-spacing: -0.5px;
                    margin-bottom: 6px;
                }

                .card-sub {
                    font-size: 14px; color: rgba(255,255,255,0.75);
                    margin-bottom: 28px;
                }

                .error-box {
                    background: rgba(239,68,68,0.2);
                    border: 1px solid rgba(239,68,68,0.4);
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 13px;
                    color: #fca5a5;
                    margin-bottom: 18px;
                }

                .field-group { margin-bottom: 16px; }

                .field-label {
                    font-size: 12px; font-weight: 600;
                    color: rgba(255,255,255,0.8);
                    letter-spacing: 0.04em;
                    display: block; margin-bottom: 7px;
                }

                .glass-input {
                    width: 100%; height: 46px;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 12px;
                    padding: 0 14px;
                    font-size: 14px;
                    font-family: 'Outfit', sans-serif;
                    color: #fff;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    box-sizing: border-box;
                }
                .glass-input::placeholder { color: rgba(255,255,255,0.45); }
                .glass-input:focus {
                    border-color: rgba(255,255,255,0.7);
                    background: rgba(255,255,255,0.22);
                }

                .pass-wrap { position: relative; }
                .pass-toggle {
                    position: absolute; right: 14px; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: rgba(255,255,255,0.6); font-size: 16px; padding: 0;
                    line-height: 1;
                }

                .submit-btn {
                    width: 100%; height: 48px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none; border-radius: 12px;
                    font-size: 15px; font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    color: #fff; cursor: pointer;
                    margin-top: 8px;
                    box-shadow: 0 4px 20px rgba(102,126,234,0.5);
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 28px rgba(102,126,234,0.65);
                }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .divider {
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                    font-size: 13px;
                    margin-top: 22px;
                }
                .divider a {
                    color: #fff; font-weight: 700;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(255,255,255,0.5);
                    transition: border-color 0.2s;
                }
                .divider a:hover { border-color: #fff; }
            `}</style>

            <div className="login-root">
                <div className="orb orb1" />
                <div className="orb orb2" />
                <div className="orb orb3" />

                <div className="glass-card">
                    <div className="logo-row">
                        <div className="logo-icon">⇄</div>
                        <span className="logo-text">SkillSwap</span>
                    </div>

                    <div className="card-title">Welcome back</div>
                    <div className="card-sub">Sign in to continue learning and teaching</div>

                    {error && <div className="error-box">{error}</div>}

                    <div className="field-group">
                        <label className="field-label">EMAIL ADDRESS</label>
                        <input
                            className="glass-input"
                            name="email" type="email"
                            placeholder="you@example.com"
                            value={form.email} onChange={handle}
                            onKeyDown={e => e.key === 'Enter' && submit()}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">PASSWORD</label>
                        <div className="pass-wrap">
                            <input
                                className="glass-input"
                                name="password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password} onChange={handle}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                                style={{ paddingRight: 42 }}
                            />
                            <button className="pass-toggle" onClick={() => setShowPass(p => !p)} type="button">
                                {showPass ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    <button className="submit-btn" onClick={submit} disabled={loading}>
                        {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sign in →'}
                    </button>

                    <div className="divider">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </div>
                </div>
            </div>
        </>
    );
}