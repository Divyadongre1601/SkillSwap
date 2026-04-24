const User = require('../../models/User');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -ratedBy');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ ...user.toObject(), rating: user.rating.average });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = getProfile;