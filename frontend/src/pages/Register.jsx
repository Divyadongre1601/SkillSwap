import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Stack, Chip, CircularProgress, Paper
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';

// Reusable chip input for skills
function SkillInput({ label, skills, setSkills }) {
    const [val, setVal] = useState('');
    const add = () => {
        const s = val.trim();
        if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
        setVal('');
    };
    return (
        <Box>
            <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>{label}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField size="small" placeholder="e.g. React" value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <Button variant="outlined" onClick={add} size="small" sx={{ minWidth: 40, px: 1, borderRadius: '8px' }}>
                    <AddIcon fontSize="small" />
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                {skills.map(s => (
                    <Chip key={s} label={s} size="small" onDelete={() => setSkills(p => p.filter(x => x !== s))}
                        sx={{ height: 24, fontSize: 12 }} />
                ))}
            </Box>
        </Box>
    );
}

export default function Register() {
    const [form, setForm]       = useState({ name: '', email: '', password: '', city: '', description: '' });
    const [offered, setOffered] = useState([]);
    const [wanted,  setWanted]  = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const navigate              = useNavigate();

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async () => {
        setError('');
        const { name, email, password, city } = form;
        if (!name || !email || !password || !city)
            return setError('Name, email, password and city are required');
        if (password.length < 6)
            return setError('Password must be at least 6 characters');
        if (offered.length === 0)
            return setError('Add at least one skill you can teach');
        if (wanted.length === 0)
            return setError('Add at least one skill you want to learn');

        setLoading(true);
        try {
            await api.post('/users/register', {
                ...form,
                skillsOffered: offered,
                skillsWanted:  wanted,
            });
            navigate('/', { state: { registered: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
            <Paper elevation={0} sx={{ width: '100%', maxWidth: 520, border: '1px solid #E2E8F0', borderRadius: 3, p: { xs: 3, sm: 4 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SwapHorizIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>Create your account</Typography>
                </Box>

                {error && <Box sx={{ mb: 2, p: 1.5, background: '#FEE2E2', borderRadius: 2, color: '#DC2626', fontSize: 13 }}>{error}</Box>}

                <Stack spacing={2.5}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField label="Full name"   name="name"  value={form.name}  onChange={handle} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        <TextField label="City"        name="city"  value={form.city}  onChange={handle} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    </Box>
                    <TextField label="Email address"   name="email"    type="email"    value={form.email}    onChange={handle} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    <TextField label="Password (min 6)" name="password" type="password" value={form.password} onChange={handle} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    <TextField label="About you (optional)" name="description" multiline rows={2} value={form.description} onChange={handle} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />

                    <SkillInput label="Skills I can teach (press Enter to add)" skills={offered} setSkills={setOffered} />
                    <SkillInput label="Skills I want to learn (press Enter to add)" skills={wanted}  setSkills={setWanted} />

                    <Button variant="contained" fullWidth size="large" onClick={submit} disabled={loading} sx={{ py: 1.5, borderRadius: '10px', mt: 1 }}>
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
                    </Button>
                </Stack>

                <Typography fontSize={13} color="text.secondary" textAlign="center" mt={2.5}>
                    Already have an account?{' '}
                    <Typography component={Link} to="/" fontSize={13} color="primary" fontWeight={600} sx={{ textDecoration: 'none' }}>Sign in</Typography>
                </Typography>
            </Paper>
        </Box>
    );
}
