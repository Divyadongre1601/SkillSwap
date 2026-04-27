const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const User     = require('../models/User');
const { generateSkillQuiz, verifyAnswers } = require('../utils/trustBuilder');

/**
 * POST /api/trust/generate-quiz
 * Generates 3 technical questions based on the user's skillsOffered.
 * Returns the questions to the frontend (does NOT store them — stateless).
 */
router.post('/generate-quiz', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('skillsOffered isVerified');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified)
            return res.status(400).json({ message: 'Your profile is already verified!' });

        if (!user.skillsOffered?.length)
            return res.status(400).json({ message: 'Add skills to your profile before verifying.' });

        const questions = await generateSkillQuiz(user.skillsOffered);
        res.json({ success: true, questions });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Quiz generation failed' });
    }
});

/**
 * POST /api/trust/submit-quiz
 * Body: { questions: string[], answers: string[] }
 * Grades answers. If VERIFIED, sets user.isVerified = true in DB.
 */
router.post('/submit-quiz', protect, async (req, res) => {
    try {
        const { questions, answers } = req.body;

        if (!Array.isArray(questions) || !Array.isArray(answers))
            return res.status(400).json({ message: 'questions and answers arrays required' });

        if (answers.some(a => !a || a.trim().length < 10))
            return res.status(400).json({ message: 'Please provide a meaningful answer to each question' });

        const result = await verifyAnswers(questions, answers);

        // If passed, mark user as verified in DB
        if (result.status === 'VERIFIED') {
            await User.findByIdAndUpdate(req.user.id, { isVerified: true });
        }

        res.json({
            success:  true,
            status:   result.status,
            score:    result.score,
            feedback: result.feedback,
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Verification failed' });
    }
});

module.exports = router;