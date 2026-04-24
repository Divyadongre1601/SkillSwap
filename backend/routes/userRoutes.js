const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const User     = require('../models/User');

const register      = require('../controllers/user/register');
const login         = require('../controllers/user/login');
const getProfile    = require('../controllers/user/getProfile');
const updateSkills  = require('../controllers/user/updateSkills');
const findMatches   = require('../controllers/user/findMatches');
const rateUser      = require('../controllers/user/rateUser');
const deleteProfile = require('../controllers/user/deleteProfile');

// Public
router.post('/register', register);
router.post('/login',    login);

// All users for dashboard browse
router.get('/all', protect, async (req, res) => {
    try {
        const search = req.query.search || '';
        const query  = {
            _id: { $ne: req.user.id },
            ...(search ? {
                $or: [
                    { name:          { $regex: search, $options: 'i' } },
                    { city:          { $regex: search, $options: 'i' } },
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
router.get('/me/profile',  protect, getProfile);
router.put('/skills',      protect, updateSkills);
router.delete('/me',       protect, deleteProfile);   // ← NEW

// Matches + rating
router.get('/me/matches',  protect, findMatches);
router.post('/rate',       protect, rateUser);

// Single user by id (keep below /me routes to avoid conflict)
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const full     = await User.findById(req.params.id).select('ratedBy');
        const hasRated = full.ratedBy.some(id => id.toString() === req.user.id);
        res.json({ ...user, rating: user.rating?.average ?? 0, hasRated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;