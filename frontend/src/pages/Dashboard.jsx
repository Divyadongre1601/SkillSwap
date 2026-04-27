import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, MenuItem,
    Select, Skeleton, Avatar, Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOn from '@mui/icons-material/LocationOn';
import Navbar from '../components/Navbar';
import AiHero from '../components/AiHero';
import api from '../api';

const COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626'];
const color = n => { let h = 0; for (let c of n) h = c.charCodeAt(0) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; };
const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

function MatchBadge({ score }) {
    if (score == null) return null;
    const bg = score >= 80 ? '#DCFCE7' : score >= 50 ? '#FEF9C3' : '#F1F5F9';
    const text = score >= 80 ? '#15803D' : score >= 50 ? '#A16207' : '#64748B';
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: bg }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: text, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: text }}>{score}% match</span>
        </span>
    );
}

function UserCard({ user, matchScore }) {
    const navigate = useNavigate();
    const bg = color(user.name);
    const [hov, setHov] = useState(false);

    return (
        <div
            onClick={() => navigate(`/user/${user._id}`)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxSizing: 'border-box',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hov ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.10)' : 'none',
            }}
        >
            {/* Avatar + name + city */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {initials(user.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>📍</span>
                        <span style={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.city || 'Unknown'}</span>
                    </div>
                    <div style={{ marginTop: 3 }}>
                        <Rating value={user.rating ?? 0} readOnly size="small" precision={0.5} sx={{ fontSize: 13 }} />
                    </div>
                </div>
            </div>

            {/* Match badge */}
            <div style={{ height: 24, marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                {matchScore != null && <MatchBadge score={matchScore} />}
            </div>

            {/* Description */}
            <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.55, height: '3.1em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 12, flexShrink: 0 }}>
                {user.description || 'No description added yet.'}
            </div>

            {/* Teaches */}
            <div style={{ marginBottom: 10, flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 5 }}>TEACHES</div>
                <div style={{ display: 'flex', gap: 4, overflow: 'hidden', height: 22 }}>
                    {user.skillsOffered.slice(0, 3).map((s, i) => (
                        <span key={i} style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea', fontWeight: 600, fontSize: 10, height: 20, padding: '0 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', maxWidth: 86, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flexShrink: 0 }}>{s}</span>
                    ))}
                </div>
            </div>

            {/* Wants */}
            <div style={{ marginBottom: 0, flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 5 }}>WANTS TO LEARN</div>
                <div style={{ display: 'flex', gap: 4, overflow: 'hidden', height: 22 }}>
                    {user.skillsWanted.slice(0, 3).map((s, i) => (
                        <span key={i} style={{ border: '1px solid #E2E8F0', color: '#64748B', fontSize: 10, height: 20, padding: '0 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', maxWidth: 86, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flexShrink: 0 }}>{s}</span>
                    ))}
                </div>
            </div>

            {/* Button */}
            <button
                onClick={e => { e.stopPropagation(); navigate(`/user/${user._id}`); }}
                style={{ marginTop: 'auto', paddingTop: 14, width: '100%', padding: '9px 0', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
                View Profile
            </button>
        </div>
    );
}

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const loggedIn = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, matchRes] = await Promise.allSettled([
                api.get('/users/all', { params: { search } }),
                api.get('/users/me/matches'),
            ]);
            if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data || []);
            if (matchRes.status === 'fulfilled') {
                const map = {};
                (matchRes.value.data.data || []).forEach(m => { map[m._id.toString()] = m.matchScore; });
                setScores(map);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => {
        const t = setTimeout(fetchData, 350);
        return () => clearTimeout(t);
    }, [fetchData]);

    // ← AI chip click sets the search bar and triggers a new fetch
    const handleAiSkillClick = skill => setSearch(skill);

    const allSkills = [...new Set(users.flatMap(u => u.skillsOffered))].sort();
    const filtered = filter === 'all' ? users : users.filter(u => u.skillsOffered.some(s => s.toLowerCase() === filter.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => (scores[b._id.toString()] ?? -1) - (scores[a._id.toString()] ?? -1));

    return (
        <>
            <Navbar />
            <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>

                {/* ── AI Hero ───────────────────────────────────────────── */}
                <AiHero
                    onSkillClick={handleAiSkillClick}
                    userSkills={loggedIn.skillsOffered || []} 
                    user={loggedIn}// Pass the user's current skills
                />

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                    {[['Total users', users.length], ['Your matches', Object.keys(scores).length], ['Showing', sorted.length]].map(([label, val]) => (
                        <Box key={label} sx={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 2, px: 2.5, py: 1.5, minWidth: 100 }}>
                            <Typography fontSize={22} fontWeight={800} sx={{ color: '#667eea' }}>{val}</Typography>
                            <Typography fontSize={12} color="text.secondary">{label}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Search + filter */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 240, position: 'relative' }}>
                        <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 18, zIndex: 1 }} />
                        <input
                            placeholder="Search by name, city, or skill…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', height: 40, paddingLeft: 38, paddingRight: 12, border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#fff', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </Box>
                    <Select value={filter} onChange={e => setFilter(e.target.value)} size="small"
                        sx={{ minWidth: 180, borderRadius: '10px', background: '#fff', fontSize: 14, height: 40 }}>
                        <MenuItem value="all">All skills</MenuItem>
                        {allSkills.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </Box>

                {/* Current search indicator */}
                {search && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography fontSize={13} color="text.secondary">Searching for:</Typography>
                        <span style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea', fontWeight: 700, fontSize: 12, padding: '3px 12px', borderRadius: 99 }}>
                            {search}
                        </span>
                        <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 13 }}>✕ clear</button>
                    </Box>
                )}

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rounded" height={310} sx={{ borderRadius: 3 }} />)}
                    </div>
                ) : sorted.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography fontSize={40}>🔍</Typography>
                        <Typography fontWeight={700} mt={1}>No users found</Typography>
                        <Typography color="text.secondary" fontSize={14}>Try a different search or filter</Typography>
                    </Box>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gridAutoRows: '310px', gap: 20 }}>
                        {sorted.map(u => <UserCard key={u._id} user={u} matchScore={scores[u._id.toString()]} />)}
                    </div>
                )}

            </Container>
        </>
    );
}