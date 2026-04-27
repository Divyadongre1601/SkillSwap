import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import api from '../api';

function SkillInput({ label, skills, setSkills }) {
    const [val, setVal] = useState('');
    const add = () => {
        const s = val.trim();
        if (s && !skills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
            setSkills(p => [...p, s]);
        setVal('');
    };
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em', display: 'block', marginBottom: 7 }}>
                {label}
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                    value={val} onChange={e => setVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    placeholder="Type skill, press Enter"
                    style={{
                        flex: 1, height: 40, background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10,
                        padding: '0 12px', fontSize: 13, fontFamily: 'Outfit, sans-serif',
                        color: '#fff', outline: 'none', boxSizing: 'border-box',
                    }}
                />
                <button onClick={add} type="button" style={{
                    width: 40, height: 40, background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10,
                    color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.length === 0
                    ? <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No skills added yet</span>
                    : skills.map(s => (
                        <span key={s} style={{
                            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
                            borderRadius: 99, padding: '3px 10px 3px 12px', fontSize: 12,
                            color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}>
                            {s}
                            <button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                                cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1,
                            }}>×</button>
                        </span>
                    ))
                }
            </div>
        </div>
    );
}

export default function Register() {
    const [form,    setForm]    = useState({ name: '', email: '', password: '', city: '', description: '' });
    const [offered, setOffered] = useState([]);
    const [wanted,  setWanted]  = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const navigate = useNavigate();

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async () => {
        setError('');
        if (!form.name || !form.email || !form.password || !form.city)
            return setError('Name, email, password and city are required');
        if (form.password.length < 6)
            return setError('Password must be at least 6 characters');
        if (offered.length === 0) return setError('Add at least one skill you can teach');
        if (wanted.length  === 0) return setError('Add at least one skill you want to learn');

        setLoading(true);
        try {
            await api.post('/users/register', { ...form, skillsOffered: offered, skillsWanted: wanted });
            navigate('/', { state: { registered: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', height: 44,
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 12, padding: '0 14px',
        fontSize: 14, fontFamily: 'Outfit, sans-serif',
        color: '#fff', outline: 'none', boxSizing: 'border-box',
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .reg-root {
                    min-height: 100vh;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #667eea);
                    background-size: 400% 400%;
                    animation: gradientShift 12s ease infinite;
                    padding: 32px 24px;
                    position: relative; overflow: hidden;
                }
                @keyframes gradientShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.3; pointer-events: none; }
                .orb1 { width: 380px; height: 380px; background: #a78bfa; top: -100px; left: -100px; }
                .orb2 { width: 280px; height: 280px; background: #f0abfc; bottom: -60px; right: -60px; }

                .reg-card {
                    background: rgba(255,255,255,0.18);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.35);
                    border-radius: 24px;
                    padding: 40px 36px;
                    width: 100%; max-width: 500px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5);
                    position: relative; z-index: 1;
                    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
                }
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(30px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .field-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.04em; display: block; margin-bottom: 7px; }
                input::placeholder { color: rgba(255,255,255,0.4); }
                input:focus { border-color: rgba(255,255,255,0.7) !important; background: rgba(255,255,255,0.22) !important; }
                .submit-btn {
                    width: 100%; height: 48px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none; border-radius: 12px;
                    font-size: 15px; font-weight: 700; font-family: 'Outfit', sans-serif;
                    color: #fff; cursor: pointer; margin-top: 8px;
                    box-shadow: 0 4px 20px rgba(102,126,234,0.5);
                    transition: transform 0.15s, box-shadow 0.15s;
                    display: flex; align-items: center; justify-content: center;
                }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(102,126,234,0.65); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .divider { text-align: center; color: rgba(255,255,255,0.55); font-size: 13px; margin-top: 20px; }
                .divider a { color: #fff; font-weight: 700; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.5); }
                .divider a:hover { border-color: #fff; }
            `}</style>

            <div className="reg-root">
                <div className="orb orb1" /><div className="orb orb2" />
                <div className="reg-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 14px rgba(102,126,234,0.5)' }}>⇄</div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>SkillSwap</span>
                    </div>

                    <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>Create account</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Join thousands exchanging skills</div>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 18 }}>
                            {error}
                        </div>
                    )}

                    {/* Name + City */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                            <label className="field-label">FULL NAME</label>
                            <input style={inputStyle} name="name" placeholder="Arjun Kumar" value={form.name} onChange={handle} />
                        </div>
                        <div>
                            <label className="field-label">CITY</label>
                            <input style={inputStyle} name="city" placeholder="Nagpur" value={form.city} onChange={handle} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label className="field-label">EMAIL ADDRESS</label>
                        <input style={inputStyle} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label className="field-label">PASSWORD (MIN 6 CHARS)</label>
                        <input style={inputStyle} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label className="field-label">ABOUT YOU (OPTIONAL)</label>
                        <textarea
                            name="description" value={form.description} onChange={handle}
                            placeholder="Describe yourself and what you want to exchange…"
                            rows={2}
                            style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none', lineHeight: 1.5 }}
                        />
                    </div>

                    <SkillInput label="SKILLS I CAN TEACH" skills={offered} setSkills={setOffered} />
                    <SkillInput label="SKILLS I WANT TO LEARN" skills={wanted}  setSkills={setWanted} />

                    <button className="submit-btn" onClick={submit} disabled={loading}>
                        {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create account →'}
                    </button>

                    <div className="divider">
                        Already have an account? <Link to="/">Sign in</Link>
                    </div>
                </div>
            </div>
        </>
    );
}