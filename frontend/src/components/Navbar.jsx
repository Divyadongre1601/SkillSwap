import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Avatar, Typography, Tooltip, Badge } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import api from '../api';

export default function Navbar() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const user      = JSON.parse(localStorage.getItem('user') || '{}');
    const initials  = (user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const [pending, setPending] = useState(0);

    // Poll for pending incoming requests every 30 seconds
    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/swap/requests?status=pending');
                setPending((data.data || []).length);
            } catch { /* token not ready yet — silent fail */ }
        };
        fetch();
        const interval = setInterval(fetch, 30000);
        return () => clearInterval(interval);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const isActive = path => location.pathname.startsWith(path);

    const links = [
        { label: 'Dashboard',  path: '/dashboard',    badge: 0       },
        { label: 'Requests',   path: '/requests',     badge: pending },
        { label: 'Messages',   path: '/chat',         badge: 0       },
        { label: 'My Profile', path: '/profile/edit', badge: 0       },
    ];

    return (
        <AppBar position="sticky" elevation={0}
            sx={{ background: '#fff', borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
            <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: '60px !important' }}>

                {/* Logo */}
                <Box onClick={() => navigate('/dashboard')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4, cursor: 'pointer' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px',
                        background: 'linear-gradient(135deg,#667eea,#764ba2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SwapHorizIcon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ letterSpacing: '-0.3px' }}>
                        SkillSwap
                    </Typography>
                </Box>

                {/* Nav links with badge */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {links.map(l => (
                        <Button key={l.path} component={Link} to={l.path} sx={{
                            color:      isActive(l.path) ? '#2563EB' : '#64748B',
                            fontWeight: isActive(l.path) ? 600 : 500,
                            fontSize: 14, px: 2,
                            background: isActive(l.path) ? 'rgba(37,99,235,0.07)' : 'transparent',
                            '&:hover':  { background: 'rgba(37,99,235,0.07)', color: '#2563EB' },
                        }}>
                            {l.badge > 0 ? (
                                <Badge badgeContent={l.badge} color="error"
                                    sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                                    {l.label}
                                </Badge>
                            ) : l.label}
                        </Button>
                    ))}
                </Box>

                {/* Right: logout + avatar */}
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" size="small" onClick={logout} sx={{
                        borderColor: '#E2E8F0', color: '#64748B', fontSize: 13, px: 2,
                        '&:hover': { borderColor: '#2563EB', color: '#2563EB' }
                    }}>
                        Log out
                    </Button>
                    <Tooltip title={user.name || 'My Profile'}>
                        <Avatar onClick={() => navigate('/profile/edit')}
                            sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                            {initials}
                        </Avatar>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
