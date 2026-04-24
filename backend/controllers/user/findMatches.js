const User = require('../../models/User');

function overlap(a = [], b = []) {
    const nb = b.map(s => s.toLowerCase());
    return a.filter(s => nb.some(t => t.includes(s.toLowerCase()) || s.toLowerCase().includes(t))).length;
}

function score(me, other) {
    const a = me.skillsWanted.length   ? overlap(me.skillsWanted,    other.skillsOffered) / me.skillsWanted.length   : 0;
    const b = other.skillsWanted.length? overlap(other.skillsWanted, me.skillsOffered)    / other.skillsWanted.length: 0;
    return Math.round(((a + b) / 2) * 100);
}

const findMatches = async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        if (!me) return res.status(404).json({ message: 'User not found' });

        const wanted  = me.skillsWanted.map(s  => new RegExp(s,  'i'));
        const offered = me.skillsOffered.map(s => new RegExp(s, 'i'));

        const query = {
            _id: { $ne: me._id },
            ...(wanted.length  ? { skillsOffered: { $in: wanted  } } : {}),
            ...(offered.length ? { skillsWanted:  { $in: offered } } : {}),
        };

        const candidates = await User.find(query).select('-password -ratedBy').lean();

        const results = candidates
            .map(u => ({
                _id:           u._id,
                name:          u.name,
                email:         u.email,
                city:          u.city,
                description:   u.description,
                skillsOffered: u.skillsOffered,
                skillsWanted:  u.skillsWanted,
                rating:        u.rating?.average ?? 0,
                matchScore:    score(me, u),
            }))
            .filter(u => u.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = findMatches;