const User = require('../../models/User');

const updateSkills = async (req, res) => {
    try {
        const { skillsOffered, skillsWanted, city, description } = req.body;
        const norm = (arr) => Array.isArray(arr) ? arr.map(s => s.trim()).filter(Boolean) : undefined;

        const updates = {};
        if (skillsOffered !== undefined) updates.skillsOffered = norm(skillsOffered);
        if (skillsWanted  !== undefined) updates.skillsWanted  = norm(skillsWanted);
        if (city          !== undefined) updates.city          = city.trim();
        if (description   !== undefined) updates.description   = description.trim();

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -ratedBy');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ ...user.toObject(), rating: user.rating.average });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = updateSkills;