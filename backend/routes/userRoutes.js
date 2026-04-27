const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const Groq = require('groq-sdk');

const register = require('../controllers/user/register');
const login = require('../controllers/user/login');
const getProfile = require('../controllers/user/getProfile');
const updateSkills = require('../controllers/user/updateSkills');
const findMatches = require('../controllers/user/findMatches');
const rateUser = require('../controllers/user/rateUser');
const deleteProfile = require('../controllers/user/deleteProfile');
// 2. Initialize Groq (Ensure you have GROQ_API_KEY in your .env)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Public
router.post('/register', register);
router.post('/login', login);

// All users for dashboard browse
router.get('/all', protect, async (req, res) => {
    try {
        const search = req.query.search || '';
        const query = {
            _id: { $ne: req.user.id },
            ...(search ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } },
                    { skillsOffered: { $elemMatch: { $regex: search, $options: 'i' } } },
                ]
            } : {})
        };
        const users = await User.find(query).select('-password -ratedBy').lean();
        res.json({
            success: true,
            data: users.map(u => ({ ...u, rating: u.rating?.average ?? 0 }))
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Own profile
router.get('/me/profile', protect, getProfile);
router.put('/skills', protect, updateSkills);
router.delete('/me', protect, deleteProfile);   // ← NEW

// Matches + rating
router.get('/me/matches', protect, findMatches);
router.post('/rate', protect, rateUser);

// Single user by id (keep below /me routes to avoid conflict)
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const full = await User.findById(req.params.id).select('ratedBy');
        const hasRated = full.ratedBy.some(id => id.toString() === req.user.id);
        res.json({ ...user, rating: user.rating?.average ?? 0, hasRated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Add the AI Suggestions Route
router.post('/ai-suggestions', protect, async (req, res) => {
    try {
        const { currentSkills } = req.body;

        // If user has no skills, return fallback immediately
        if (!currentSkills || currentSkills.length === 0) {
            return res.json({ suggestions: ['TypeScript', 'System Design', 'AWS', 'Docker', 'GraphQL'] });
        }

        const prompt = `The user knows these skills: ${currentSkills.join(', ')}. 
        Suggest 5 related but different high-demand technical skills they should learn next.
        Return ONLY a JSON array of strings. Do not include any conversational text.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            // Change this line:
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
        });

        // Extract and clean the AI response
        let content = completion.choices[0].message.content;

        // Safety: sometimes LLMs include text outside the array, this helps parse just the array
        const arrayMatch = content.match(/\[.*\]/s);
        const suggestions = arrayMatch ? JSON.parse(arrayMatch[0]) : JSON.parse(content);

        res.json({ success: true, suggestions });
    } catch (err) {
        console.error("Groq Error:", err.message);
        // If AI fails, return the fallback so the UI doesn't break
        res.json({ suggestions: ['TypeScript', 'System Design', 'AWS', 'Docker', 'GraphQL'] });
    }
});

module.exports = router;