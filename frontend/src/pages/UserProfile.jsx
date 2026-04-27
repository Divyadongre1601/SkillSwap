import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Chip, Button, Avatar, Rating,
    Divider, Paper, CircularProgress, Snackbar, Alert
} from '@mui/material';
import VerificationModal from '../components/VerificationModal';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon     from '@mui/icons-material/SchoolOutlined';
import LightbulbOutlinedIcon  from '@mui/icons-material/LightbulbOutlined';
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined';
import SendIcon               from '@mui/icons-material/Send';
import ForumIcon              from '@mui/icons-material/Forum';
import Navbar from '../components/Navbar';
import api    from '../api';

const COLORS  = ['#2563EB','#7C3AED','#DB2777','#059669','#D97706','#DC2626'];
const color   = n => { let h=0; for(let c of n) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; };
const initials= n => n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

export default function UserProfile() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const me       = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwn    = me._id?.toString() === id;

    const [user,       setUser]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [snack,      setSnack]      = useState({ open: false, msg: '', severity: 'success' });
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/users/${id}`);
                setUser(data);
            } catch {
                notify('Could not load user', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const sendRequest = async () => {
        setRequesting(true);
        try {
            const { data } = await api.post('/swap/send', { toUserId: id });
            notify(data.message);
        } catch (err) {
            notify(err.response?.data?.message || 'Error sending request', 'error');
        } finally {
            setRequesting(false);
        }
    };

    const handleRate = async (_, value) => {
        if (!value || user.hasRated || isOwn) return;
        try {
            const { data } = await api.post('/users/rate', { userId: id, rating: value });
            setUser(prev => ({ ...prev, rating: data.rating, hasRated: true }));
            notify('Rating saved!');
        } catch (err) {
            notify(err.response?.data?.message || 'Could not save rating', 'error');
        }
    };

    const handleVerifySuccess = () => {
        setIsVerifyModalOpen(false);
        // Update local user state to show the badge immediately
        setUser(prev => ({ ...prev, isVerified: true }));
        setSnack({ open: true, msg: 'Profile Verified successfully!', severity: 'success' });
    };

    if (loading) return (
        <>
            <Navbar />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        </>
    );

    if (!user) return (
        <>
            <Navbar />
            <Container sx={{ mt: 6, textAlign: 'center' }}>
                <Typography fontSize={48}>😕</Typography>
                <Typography variant="h6" fontWeight={700} mt={1}>User not found</Typography>
                <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Back</Button>
            </Container>
        </>
    );

    const bg = color(user.name);

    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}
                    sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    Back
                </Button>

                {/* Header card */}
                <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ height: 90, background: `linear-gradient(135deg, ${bg}33, ${bg}66)` }} />
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Avatar sx={{ width: 72, height: 72, bgcolor: bg, fontSize: 26, fontWeight: 800, border: '3px solid #fff', mt: -4.5, mb: 2 }}>
                            {initials(user.name)}
                        </Avatar>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="h5" fontWeight={800}>{user.name}</Typography>
                                {user.city && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.5 }}>
                                        <LocationOnOutlinedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                                        <Typography fontSize={14} color="text.secondary">{user.city}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ mt: 1.5 }}>
                                    <Rating
                                        value={user.rating ?? 0}
                                        precision={1}
                                        readOnly={isOwn || user.hasRated}
                                        onChange={handleRate}
                                        sx={{ fontSize: 22 }}
                                    />
                                    <Typography fontSize={12} color="text.secondary" mt={0.3}>
                                        {isOwn
                                            ? `Your rating: ${user.rating?.toFixed(1) ?? '0.0'} / 5`
                                            : user.hasRated
                                                ? `Already rated · ${user.rating?.toFixed(1) ?? '0.0'} / 5`
                                                : 'Click a star to rate this user'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Own profile → Edit button */}
                            {isOwn && (
                                <Button variant="outlined" startIcon={<EditOutlinedIcon />}
                                    onClick={() => navigate('/profile/edit')}
                                    sx={{ borderRadius: '10px' }}>
                                    Edit profile
                                </Button>
                            )}

                            {/* Other profile → Message + Send Request */}
                            {!isOwn && (
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                    <Button variant="outlined" startIcon={<ForumIcon />}
                                        onClick={() => navigate(`/chat/${id}`)}
                                        sx={{ borderRadius: '10px' }}>
                                        Message
                                    </Button>
                                    <Button variant="contained" startIcon={<SendIcon />}
                                        onClick={sendRequest} disabled={requesting}
                                        sx={{ px: 3, borderRadius: '10px' }}>
                                        {requesting
                                            ? <CircularProgress size={18} color="inherit" />
                                            : 'Send Swap Request'}
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {user.description && (
                            <Typography color="text.secondary" fontSize={14} lineHeight={1.7} mt={2}>
                                {user.description}
                            </Typography>
                        )}
                    </Box>
                </Paper>

                {/* Skills */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 17, color: '#2563EB' }} />
                            </Box>
                            <Typography fontWeight={700} fontSize={15}>Skills I can teach</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {user.skillsOffered?.length
                                ? user.skillsOffered.map((s, i) => (
                                    <Chip key={i} label={s} sx={{ bgcolor: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 600, fontSize: 13, height: 28 }} />
                                ))
                                : <Typography fontSize={13} color="text.secondary">None listed yet</Typography>}
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LightbulbOutlinedIcon sx={{ fontSize: 17, color: '#D97706' }} />
                            </Box>
                            <Typography fontWeight={700} fontSize={15}>Skills I want to learn</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {user.skillsWanted?.length
                                ? user.skillsWanted.map((s, i) => (
                                    <Chip key={i} label={s} variant="outlined" sx={{ fontSize: 13, height: 28, borderColor: '#FCD34D', color: '#92400E', bgcolor: 'rgba(245,158,11,0.05)', fontWeight: 500 }} />
                                ))
                                : <Typography fontSize={13} color="text.secondary">None listed yet</Typography>}
                        </Box>
                    </Paper>
                </Box>
            </Container>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} sx={{ width: '100%', borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );
}
