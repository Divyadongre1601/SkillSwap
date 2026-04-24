import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Tabs, Tab, Card, CardContent,
    Chip, Button, Avatar, CircularProgress, Snackbar, Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import api    from '../api';

const COLORS  = ['#2563EB','#7C3AED','#DB2777','#059669','#D97706','#DC2626'];
const color   = n => { let h=0; for(let c of (n||'?')) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; };
const initials= n => (n||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

const STATUS_COLOR = { pending: 'warning', accepted: 'success', rejected: 'error', cancelled: 'default' };

export default function Requests() {
    const navigate = useNavigate();
    const [tab,      setTab]      = useState(0);
    const [incoming, setIncoming] = useState([]);
    const [sent,     setSent]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [snack,    setSnack]    = useState({ open: false, msg: '', severity: 'success' });

    const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    const loadAll = async () => {
        setLoading(true);
        try {
            const [inc, snt] = await Promise.all([
                api.get('/swap/requests?status=pending'),
                api.get('/swap/sent'),
            ]);
            setIncoming(inc.data.data || []);
            setSent(snt.data.data || []);
        } catch (err) { notify('Failed to load requests', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAll(); }, []);

    const update = async (requestId, status) => {
        try {
            await api.put('/swap/update', { requestId, status });
            notify(`Request ${status}`);
            loadAll();
        } catch (err) { notify(err.response?.data?.message || 'Error', 'error'); }
    };

    const RequestCard = ({ req, type }) => {
        const person = type === 'incoming' ? req.from : req.to;
        const bg = color(person.name);
        return (
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: bg, width: 44, height: 44, fontSize: 15, fontWeight: 700 }}
                            onClick={() => navigate(`/user/${person._id}`)} style={{ cursor: 'pointer' }}>
                            {initials(person.name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={700} fontSize={15}>{person.name}</Typography>
                            <Typography fontSize={12} color="text.secondary">{person.city}</Typography>
                        </Box>
                        <Chip label={req.status} size="small" color={STATUS_COLOR[req.status]} sx={{ fontWeight: 600, fontSize: 11 }} />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>OFFERS</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {person.skillsOffered.map((s,i) => <Chip key={i} label={s} size="small" sx={{ bgcolor: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 600, fontSize: 11, height: 22 }} />)}
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>WANTS</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {person.skillsWanted.map((s,i) => <Chip key={i} label={s} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />)}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {type === 'incoming' && req.status === 'pending' && (
                            <>
                                <Button variant="contained" size="small" color="success" onClick={() => update(req._id, 'accepted')} sx={{ borderRadius: '8px' }}>Accept</Button>
                                <Button variant="outlined"  size="small" color="error"   onClick={() => update(req._id, 'rejected')} sx={{ borderRadius: '8px' }}>Decline</Button>
                            </>
                        )}
                        {type === 'sent' && req.status === 'pending' && (
                            <Button variant="outlined" size="small" color="error" onClick={() => update(req._id, 'cancelled')} sx={{ borderRadius: '8px' }}>Cancel</Button>
                        )}
                        {req.status === 'accepted' && (
                            <Button variant="outlined" size="small" startIcon={<span>💬</span>}
                                onClick={() => navigate(`/chat/${person._id}`)} sx={{ borderRadius: '8px' }}>
                                Start Chat
                            </Button>
                        )}
                        <Button variant="text" size="small" onClick={() => navigate(`/user/${person._id}`)} sx={{ borderRadius: '8px', ml: 'auto' }}>
                            View Profile
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight={800} mb={1}>Swap Requests</Typography>
                <Typography color="text.secondary" mb={3}>Manage your skill exchange requests</Typography>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #E2E8F0' }}>
                    <Tab label={`Incoming (${incoming.length})`} sx={{ fontWeight: 600, textTransform: 'none' }} />
                    <Tab label={`Sent (${sent.length})`}         sx={{ fontWeight: 600, textTransform: 'none' }} />
                </Tabs>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : tab === 0 ? (
                    incoming.length === 0
                        ? <Box sx={{ textAlign: 'center', py: 8 }}><Typography fontSize={40}>📭</Typography><Typography fontWeight={600} mt={1}>No pending requests</Typography></Box>
                        : incoming.map(r => <RequestCard key={r._id} req={r} type="incoming" />)
                ) : (
                    sent.length === 0
                        ? <Box sx={{ textAlign: 'center', py: 8 }}><Typography fontSize={40}>📤</Typography><Typography fontWeight={600} mt={1}>No sent requests</Typography></Box>
                        : sent.map(r => <RequestCard key={r._id} req={r} type="sent" />)
                )}
            </Container>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} sx={{ width: '100%', borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </>
    );
}
