import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Avatar, CircularProgress,
    List, ListItemButton, ListItemAvatar, ListItemText, Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon    from '@mui/icons-material/Done';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import api    from '../api';

const COLORS  = ['#2563EB','#7C3AED','#DB2777','#059669','#D97706','#DC2626'];
const color   = n => { let h=0; for(let c of (n||'?')) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; };
const initials= n => (n||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const fmt     = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

let socket;

export default function Chat() {
    const { userId: paramUserId } = useParams();
    const navigate                = useNavigate();
    const me                      = JSON.parse(localStorage.getItem('user') || '{}');
    const token                   = localStorage.getItem('token');

    const [convos,       setConvos]       = useState([]);
    const [activeId,     setActiveId]     = useState(paramUserId || null);
    const [activeName,   setActiveName]   = useState('');
    const [messages,     setMessages]     = useState([]);
    const [text,         setText]         = useState('');
    const [typing,       setTyping]       = useState(false);
    const [loadingConvo, setLoadingConvo] = useState(false);
    const [onlineUsers,  setOnlineUsers]  = useState([]);
    const bottomRef  = useRef(null);
    const typingTimer= useRef(null);
    const activeIdRef= useRef(activeId);

    useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

    // ── Connect socket ─────────────────────────────────────────────────────
    useEffect(() => {
        socket = io('http://localhost:5000', { auth: { token } });

        socket.on('online_users', ids => setOnlineUsers(ids));

        socket.on('receive_message', msg => {
            setMessages(prev => {
                // avoid duplicates
                if (prev.some(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            // Mark read immediately if this chat is open
            if (msg.sender.toString() !== me._id?.toString() &&
                msg.receiver.toString() === me._id?.toString() &&
                activeIdRef.current === msg.sender.toString()) {
                socket.emit('mark_read', { roomId: msg.roomId });
                // flip local read flag
                setMessages(prev => prev.map(m =>
                    m.roomId === msg.roomId && !m.read ? { ...m, read: true } : m
                ));
            }
        });

        // When receiver reads messages, update our sent messages' read flag
        socket.on('messages_read', ({ roomId }) => {
            setMessages(prev => prev.map(m =>
                m.roomId === roomId ? { ...m, read: true } : m
            ));
        });

        socket.on('user_typing',      () => setTyping(true));
        socket.on('user_stop_typing', () => setTyping(false));

        return () => socket.disconnect();
    }, [token]);

    // ── Load conversations ─────────────────────────────────────────────────
    useEffect(() => {
        api.get('/chat/conversations').then(({ data }) => {
            setConvos(data.data || []);
        }).catch(console.error);

        if (paramUserId) openChat(paramUserId);
    }, []);

    // ── Open chat ──────────────────────────────────────────────────────────
    const openChat = async (userId, name) => {
        setActiveId(userId);
        activeIdRef.current = userId;
        setLoadingConvo(true);
        socket.emit('join_room', { otherUserId: userId });

        try {
            if (name) {
                setActiveName(name);
            } else {
                const found = convos.find(c => c.partnerId.toString() === userId);
                if (found) setActiveName(found.partnerName);
                else {
                    const { data } = await api.get(`/users/${userId}`);
                    setActiveName(data.name);
                }
            }
            const { data } = await api.get(`/chat/${userId}`);
            setMessages(data.data || []);
            // mark as read after loading
            socket.emit('mark_read', { roomId: [me._id, userId].sort().join('_') });
        } catch (err) { console.error(err); }
        finally { setLoadingConvo(false); }

        // Refresh conversations sidebar to clear unread count
        api.get('/chat/conversations').then(({ data }) => setConvos(data.data || []));
    };

    // ── Auto-scroll ────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Send ───────────────────────────────────────────────────────────────
    const send = () => {
        const t = text.trim();
        if (!t || !activeId) return;
        socket.emit('send_message', { receiverId: activeId, text: t });
        setText('');
        socket.emit('stop_typing', { receiverId: activeId });
    };

    const handleTyping = e => {
        setText(e.target.value);
        socket.emit('typing', { receiverId: activeId });
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => socket.emit('stop_typing', { receiverId: activeId }), 1500);
    };

    const isOnline = id => onlineUsers.includes(id?.toString());

    // ── Read receipt icon ──────────────────────────────────────────────────
    const ReadReceipt = ({ msg }) => {
        if (msg.sender.toString() !== me._id?.toString()) return null;
        return msg.read
            ? <DoneAllIcon sx={{ fontSize: 13, color: '#60A5FA', ml: 0.5, verticalAlign: 'middle' }} />
            : <DoneIcon    sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', ml: 0.5, verticalAlign: 'middle' }} />;
    };

    return (
        <>
            <Navbar />
            <Box sx={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#F8FAFC' }}>

                {/* ── Sidebar ───────────────────────────────────────── */}
                <Box sx={{ width: 280, borderRight: '1px solid #E2E8F0', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
                        <Typography fontWeight={700} fontSize={16}>Messages</Typography>
                    </Box>
                    <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                        {convos.length === 0 && (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography fontSize={13} color="text.secondary">
                                    No conversations yet.<br />Visit a profile and click "Message".
                                </Typography>
                            </Box>
                        )}
                        {convos.map(c => (
                            <ListItemButton key={c.partnerId}
                                selected={activeId === c.partnerId.toString()}
                                onClick={() => openChat(c.partnerId.toString(), c.partnerName)}
                                sx={{ px: 2, py: 1.5, '&.Mui-selected': { background: 'rgba(37,99,235,0.06)' } }}>
                                <ListItemAvatar>
                                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={isOnline(c.partnerId)
                                            ? <Box sx={{ width: 10, height: 10, bgcolor: '#10B981', borderRadius: '50%', border: '2px solid #fff' }} />
                                            : null}>
                                        <Avatar sx={{ bgcolor: color(c.partnerName), width: 40, height: 40, fontSize: 14, fontWeight: 700 }}>
                                            {initials(c.partnerName)}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography fontWeight={600} fontSize={14} noWrap>{c.partnerName}</Typography>}
                                    secondary={<Typography fontSize={12} color="text.secondary" noWrap>{c.lastMessage}</Typography>}
                                />
                                {c.unread > 0 && (
                                    <Box sx={{ ml: 1, bgcolor: '#2563EB', color: '#fff', borderRadius: '99px', fontSize: 11, fontWeight: 700, px: 0.8, py: 0.2, minWidth: 20, textAlign: 'center' }}>
                                        {c.unread}
                                    </Box>
                                )}
                            </ListItemButton>
                        ))}
                    </List>
                </Box>

                {/* ── Chat window ───────────────────────────────────── */}
                {activeId ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: color(activeName), width: 38, height: 38, fontSize: 14, fontWeight: 700 }}>
                                {initials(activeName)}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize={15}>{activeName}</Typography>
                                <Typography fontSize={12} color={isOnline(activeId) ? '#10B981' : 'text.secondary'}>
                                    {isOnline(activeId) ? '● Online' : '○ Offline'}
                                </Typography>
                            </Box>
                            <Button size="small" variant="outlined" sx={{ ml: 'auto', borderRadius: '8px', fontSize: 12 }}
                                onClick={() => navigate(`/user/${activeId}`)}>
                                View Profile
                            </Button>
                        </Box>

                        {/* Messages */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {loadingConvo ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : messages.length === 0 ? (
                                <Box sx={{ textAlign: 'center', mt: 8 }}>
                                    <Typography fontSize={36}>💬</Typography>
                                    <Typography fontWeight={600} mt={1}>Start the conversation</Typography>
                                    <Typography fontSize={13} color="text.secondary">Say hello to {activeName}!</Typography>
                                </Box>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMine = msg.sender.toString() === me._id?.toString();
                                    return (
                                        <Box key={msg._id || i} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                            <Box sx={{
                                                maxWidth: '68%', px: 2, py: 1,
                                                borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                                background: isMine ? 'linear-gradient(135deg,#2563EB,#1D4ED8)' : '#fff',
                                                border: isMine ? 'none' : '1px solid #E2E8F0',
                                                color: isMine ? '#fff' : 'inherit',
                                            }}>
                                                <Typography fontSize={14} lineHeight={1.5}>{msg.text}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.3, mt: 0.3 }}>
                                                    <Typography fontSize={10} sx={{ opacity: 0.7 }}>{fmt(msg.createdAt)}</Typography>
                                                    <ReadReceipt msg={msg} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                            {typing && (
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ px: 2, py: 1, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px 14px 14px 4px' }}>
                                        <Typography fontSize={13} color="text.secondary">typing…</Typography>
                                    </Box>
                                </Box>
                            )}
                            <div ref={bottomRef} />
                        </Box>

                        {/* Input */}
                        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0', background: '#fff', display: 'flex', gap: 1.5 }}>
                            <TextField fullWidth size="small" placeholder={`Message ${activeName}…`}
                                value={text} onChange={handleTyping}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#F8FAFC' } }}
                            />
                            <Button variant="contained" onClick={send} disabled={!text.trim()}
                                sx={{ minWidth: 48, width: 48, height: 40, borderRadius: '10px', p: 0 }}>
                                <SendIcon fontSize="small" />
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                        <Typography fontSize={48}>💬</Typography>
                        <Typography fontWeight={700} fontSize={18}>Your messages</Typography>
                        <Typography color="text.secondary" fontSize={14} textAlign="center">
                            Select a conversation or go to a user profile<br />and click "Message" to start chatting.
                        </Typography>
                    </Box>
                )}
            </Box>
        </>
    );
}
