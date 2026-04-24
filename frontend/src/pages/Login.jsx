import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Stack, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import VisibilityOutlinedIcon     from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon  from '@mui/icons-material/VisibilityOffOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import api from '../api';

export default function Login() {
    const [form, setForm]           = useState({ email: '', password: '' });
    const [showPass, setShowPass]   = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const navigate                  = useNavigate();

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

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
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
            {/* Left panel */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)', flexDirection: 'column', justifyContent: 'center', p: 8, position: 'relative', overflow: 'hidden' }}>
                {[0,1,2].map(i => <Box key={i} sx={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', width: 200+i*150, height: 200+i*150, top: '50%', right: -100-i*80, transform: 'translateY(-50%)' }} />)}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SwapHorizIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h5" fontWeight={800} color="white">SkillSwap</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={800} color="white" sx={{ lineHeight: 1.2, mb: 2 }}>
                        Learn skills.<br />Teach skills.<br />Grow together.
                    </Typography>
                    <Typography color="rgba(255,255,255,0.75)" fontSize={16}>
                        Exchange your expertise with people who have what you need.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4, mt: 6 }}>
                        {[['500+','Users'],['1200+','Sessions'],['4.8★','Avg Rating']].map(([v,l]) => (
                            <Box key={l}>
                                <Typography color="white" fontWeight={800} fontSize={22}>{v}</Typography>
                                <Typography color="rgba(255,255,255,0.65)" fontSize={13}>{l}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Right panel */}
            <Box sx={{ flex: { xs: 1, md: '0 0 440px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <Box sx={{ width: '100%', maxWidth: 360 }}>
                    <Typography variant="h5" fontWeight={800} mb={0.5}>Welcome back</Typography>
                    <Typography color="text.secondary" fontSize={14} mb={4}>Sign in to your SkillSwap account</Typography>

                    {error && <Box sx={{ mb: 2, p: 1.5, background: '#FEE2E2', borderRadius: 2, color: '#DC2626', fontSize: 13 }}>{error}</Box>}

                    <Stack spacing={2.5}>
                        <TextField label="Email" name="email" type="email" fullWidth value={form.email} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                        <TextField label="Password" name="password" type={showPass ? 'text' : 'password'} fullWidth value={form.password} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(p => !p)} size="small">{showPass ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}</IconButton></InputAdornment> }}
                        />
                        <Button variant="contained" fullWidth size="large" onClick={submit} disabled={loading} sx={{ py: 1.5, borderRadius: '10px' }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                        </Button>
                    </Stack>

                    <Typography fontSize={13} color="text.secondary" textAlign="center" mt={3}>
                        Don't have an account?{' '}
                        <Typography component={Link} to="/register" fontSize={13} color="primary" fontWeight={600} sx={{ textDecoration: 'none' }}>
                            Sign up
                        </Typography>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
