const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const User     = require('../models/User');
const { getAiSkillSuggestions } = require('../utils/aiRecommender');

// GET /api/ai/suggestions
// Returns AI-recommended skills based on the logged-in user's profile
router.get('/suggestions', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('skillsOffered skillsWanted');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const suggestions = await getAiSkillSuggestions(
            user.skillsOffered,
            user.skillsWanted
        );

        res.json({ success: true, data: suggestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;