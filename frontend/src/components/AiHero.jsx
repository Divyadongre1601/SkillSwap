import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import api from '../api';

const FALLBACK = ['TypeScript', 'System Design', 'AWS', 'Docker', 'GraphQL'];

// Added 'user' to the props here
export default function AiHero({ onSkillClick, userSkills, user }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const fetchAiSuggestions = async () => {
            try {
                const res = await api.post('/users/ai-suggestions', { 
                    currentSkills: userSkills 
                });
                // Check if your backend returns { suggestions: [] } or { data: { suggestions: [] } }
                const suggestions = res.data.suggestions || res.data.data?.suggestions;
                setSkills(suggestions || FALLBACK);
            } catch (err) {
                console.error("AI Fetch error:", err);
                setSkills(FALLBACK);
            } finally {
                setLoading(false);
            }
        };

        if (userSkills?.length > 0) {
            fetchAiSuggestions();
        } else {
            setSkills(FALLBACK);
            setLoading(false);
        }
    }, [userSkills]);

    return (
        <Box sx={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            mb: 4,
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102,126,234,0.35)',
        }}>
            <Box sx={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                pointerEvents: 'none',
            }} />

            <Box sx={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -80, right: -60, filter: 'blur(40px)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(240,171,252,0.12)', bottom: -60, left: '30%', filter: 'blur(50px)', pointerEvents: 'none' }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>
                        🤖
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        AI Recommendations
                    </Typography>
                </Box>

                {/* Fixed the name access here */}
                <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', mb: 0.5 }}>
                    Ready to level up, {user?.name?.split(' ')[0] || 'there'}? 🚀
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', mb: 3 }}>
                    Based on your skills, AI suggests you explore these next — click any to search
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                            Generating recommendations…
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {skills.map((skill, i) => (
                            <button
                                key={skill}
                                onClick={() => onSkillClick(skill)}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: hovered === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
                                    border: '1px solid rgba(255,255,255,0.4)',
                                    borderRadius: 99,
                                    padding: '7px 18px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: 'inherit',
                                    color: hovered === i ? '#764ba2' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: hovered === i ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
                                    transform: hovered === i ? 'translateY(-2px)' : 'translateY(0)',
                                }}
                            >
                                ✦ {skill}
                            </button>
                        ))}

                        <Box sx={{
                            display: 'flex', alignItems: 'center',
                            ml: { xs: 0, md: 'auto' },
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 99, px: 2, py: 0.8,
                        }}>
                            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.05em' }}>
                                 ⚡ POWERED BY GROQ
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}