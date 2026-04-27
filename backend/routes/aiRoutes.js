const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const User     = require('../models/User');
const { getAiSkillSuggestions } = require('../utils/aiRecommender');

// Change GET to POST
router.post('/suggestions', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('skillsOffered skillsWanted');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const suggestions = await getAiSkillSuggestions(
            user.skillsOffered,
            user.skillsWanted
        );

        // Change "data: suggestions" to "suggestions" to match your AiHero.jsx logic
        res.json({ success: true, suggestions }); 
    } catch (err) {
        console.error("AI Route Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;