import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, TextField, Button, Avatar,
    Paper, Chip, Divider, CircularProgress, Snackbar, Alert,
    Stack, LinearProgress, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions
} from '@mui/material';
import ArrowBack  from '@mui/icons-material/ArrowBack';
import Add        from '@mui/icons-material/Add';
import Save       from '@mui/icons-material/Save';
import School     from '@mui/icons-material/School';
import Lightbulb  from '@mui/icons-material/Lightbulb';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Delete     from '@mui/icons-material/Delete';
import Navbar from '../components/Navbar';
import api    from '../api';

const COLORS  = ['#2563EB','#7C3AED','#DB2777','#059669','#D97706','#DC2626'];
const color   = n => { let h=0; for(let c of (n||'?')) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; };
const initials= n => (n||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

function completeness(form, offered, wanted) {
    const checks = [
        { label: 'Add your full name',              done: form.name.trim().length > 0         },
        { label: 'Add your city',                   done: form.city.trim().length > 0         },
        { label: 'Write a bio (20+ chars)',          done: form.description.trim().length > 20 },
        { label: 'Add a skill you can teach',       done: offered.length > 0                 },
        { label: 'Add a skill you want to learn',   done: wanted.length  > 0                 },
        { label: 'Add 2+ skills you can teach',     done: offered.length >= 2                },
        { label: 'Add 2+ skills you want to learn', done: wanted.length  >= 2                },
    ];
    return {
        score: Math.round(checks.filter(c => c.done).length / checks.length * 100),
        checks,
    };
}

function SkillInput({ skills, setSkills, chipSx }) {
    const [val, setVal] = useState('');
    const add = () => {
        const s = val.trim();
        if (s && !skills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
            setSkills(p => [...p, s]);
        setVal('');
    };
    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                    size="small"
                    placeholder="Type a skill and press Enter"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <Button variant="outlined" onClick={add} size="small"
                    sx={{ minWidth: 42, px: 1, borderRadius: '8px' }}>
                    <Add fontSize="small" />
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {skills.length === 0
                    ? <Typography fontSize={13} color="text.secondary">No skills added yet</Typography>
                    : skills.map(s => (
                        <Chip key={s} label={s} size="small"
                            onDelete={() => setSkills(p => p.filter(x => x !== s))}
                            sx={chipSx} />
                    ))
                }
            </Box>
        </Box>
    );
}

export default function EditProfile() {
    const navigate = useNavigate();
    const [form,        setForm]        = useState({ name: '', city: '', description: '' });
    const [offered,     setOffered]     = useState([]);
    const [wanted,      setWanted]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [deleting,    setDeleting]    = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [snack,       setSnack]       = useState({ open: false, msg: '', severity: 'success' });

    const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => {
        api.get('/users/me/profile')
            .then(({ data }) => {
                setForm({ name: data.name || '', city: data.city || '', description: data.description || '' });
                setOffered(data.skillsOffered || []);
                setWanted(data.skillsWanted   || []);
                localStorage.setItem('user', JSON.stringify(data));
            })
            .catch(() => notify('Could not load profile', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        if (!form.name.trim()) return notify('Name cannot be empty', 'error');
        setSaving(true);
        try {
            const { data } = await api.put('/users/skills', {
                ...form, skillsOffered: offered, skillsWanted: wanted,
            });
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...data }));
            notify('Profile saved!');
        } catch (err) {
            notify(err.response?.data?.message || 'Save failed', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete('/users/me');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        } catch (err) {
            notify(err.response?.data?.message || 'Could not delete account', 'error');
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        </>
    );

    const { score, checks } = completeness(form, offered, wanted);
    const bg            = color(form.name);
    const progressColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#2563EB';

    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}
                    sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    Back
                </Button>

                <Typography variant="h4" fontWeight={800} mb={0.5}>My Profile</Typography>
                <Typography color="text.secondary" fontSize={14} mb={4}>
                    Keep your profile complete to get better matches
                </Typography>

                {/* ── Completeness card ─────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography fontWeight={700} fontSize={15}>Profile completeness</Typography>
                        <Typography fontWeight={800} fontSize={20} color={progressColor}>{score}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={score} sx={{
                        height: 8, borderRadius: 99, mb: 2, bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 99 },
                    }} />
                    <Typography fontSize={12} color="text.secondary" mb={1.5}>
                        {score === 100
                            ? '🎉 Your profile is 100% complete!'
                            : score >= 80
                                ? '✅ Almost there — a few more steps.'
                                : 'Complete your profile to appear in more matches.'}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.8 }}>
                        {checks.map(c => (
                            <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                {c.done
                                    ? <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
                                    : <RadioButtonUnchecked sx={{ fontSize: 16, color: '#CBD5E1' }} />}
                                <Typography fontSize={12}
                                    color={c.done ? 'text.secondary' : 'text.primary'}
                                    sx={{ textDecoration: c.done ? 'line-through' : 'none', opacity: c.done ? 0.55 : 1 }}>
                                    {c.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                {/* ── Avatar preview ─────────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ height: 80, background: `linear-gradient(135deg,${bg}33,${bg}66)` }} />
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Avatar sx={{ width: 68, height: 68, bgcolor: bg, fontSize: 24, fontWeight: 800, border: '3px solid #fff', mt: -4, mb: 2 }}>
                            {initials(form.name)}
                        </Avatar>
                        <Typography fontWeight={700} fontSize={18}>{form.name || 'Your name'}</Typography>
                        <Typography fontSize={13} color="text.secondary">{form.city || 'Your city'}</Typography>
                    </Box>
                </Paper>

                {/* ── Basic info ─────────────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 3 }}>
                    <Typography fontWeight={700} fontSize={15} mb={2.5}>Basic info</Typography>
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Full name" value={form.name} size="small"
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                            <TextField label="City" value={form.city} size="small"
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Box>
                        <TextField
                            label="About you" value={form.description} size="small"
                            multiline rows={3}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Describe yourself and what you're looking to exchange…"
                            helperText={`${form.description.length} chars — write at least 20 for a complete profile`}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                    </Stack>
                </Paper>

                {/* ── Skills I teach ─────────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <School sx={{ fontSize: 16, color: '#2563EB' }} />
                        </Box>
                        <Typography fontWeight={700} fontSize={15}>Skills I can teach</Typography>
                        <Chip label={offered.length} size="small"
                            sx={{ ml: 'auto', bgcolor: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 700, height: 22, fontSize: 11 }} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <SkillInput skills={offered} setSkills={setOffered}
                        chipSx={{ bgcolor: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 600, fontSize: 12, height: 26 }} />
                </Paper>

                {/* ── Skills I want ──────────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lightbulb sx={{ fontSize: 16, color: '#D97706' }} />
                        </Box>
                        <Typography fontWeight={700} fontSize={15}>Skills I want to learn</Typography>
                        <Chip label={wanted.length} size="small"
                            sx={{ ml: 'auto', bgcolor: 'rgba(245,158,11,0.08)', color: '#D97706', fontWeight: 700, height: 22, fontSize: 11 }} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <SkillInput skills={wanted} setSkills={setWanted}
                        chipSx={{ bgcolor: 'rgba(245,158,11,0.06)', color: '#92400E', fontWeight: 600, fontSize: 12, height: 26, border: '1px solid #FCD34D' }} />
                </Paper>

                {/* ── Save button ────────────────────────────────────────── */}
                <Button variant="contained" size="large" fullWidth
                    startIcon={saving ? null : <Save />}
                    onClick={save} disabled={saving}
                    sx={{ py: 1.5, borderRadius: '10px', fontSize: 15, mb: 3 }}>
                    {saving ? <CircularProgress size={22} color="inherit" /> : 'Save changes'}
                </Button>

                {/* ── Danger zone ────────────────────────────────────────── */}
                <Paper elevation={0} sx={{ border: '1px solid #FEE2E2', borderRadius: 3, p: 3 }}>
                    <Typography fontWeight={700} fontSize={15} color="#DC2626" mb={0.5}>
                        Danger zone
                    </Typography>
                    <Typography fontSize={13} color="text.secondary" mb={2}>
                        Permanently delete your account, swap requests, and chat history.
                        This cannot be undone.
                    </Typography>
                    <Button variant="outlined" startIcon={<Delete />}
                        onClick={() => setConfirmOpen(true)}
                        sx={{ borderColor: '#FCA5A5', color: '#DC2626',
                            '&:hover': { background: '#FEE2E2', borderColor: '#DC2626' } }}>
                        Delete my account
                    </Button>
                </Paper>
            </Container>

            {/* Confirm dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete your account?</DialogTitle>
                <DialogContent>
                    <DialogContentText fontSize={14}>
                        This will permanently delete your profile, all swap requests, and your
                        entire chat history. You cannot undo this.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setConfirmOpen(false)} variant="outlined"
                        sx={{ borderRadius: '8px', borderColor: '#E2E8F0', color: '#64748B' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" disabled={deleting}
                        sx={{ borderRadius: '8px', bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}>
                        {deleting ? <CircularProgress size={18} color="inherit" /> : 'Yes, delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
