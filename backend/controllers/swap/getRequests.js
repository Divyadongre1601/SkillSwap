const SwapRequest = require('../../models/SwapRequest');

const flat = (u) => ({
    _id: u._id, name: u.name, email: u.email,
    city: u.city, description: u.description,
    skillsOffered: u.skillsOffered, skillsWanted: u.skillsWanted,
    rating: u.rating?.average ?? 0,
});

const getRequests = async (req, res) => {
    try {
        const rows = await SwapRequest.find({ toUser: req.user.id, status: req.query.status || 'pending' })
            .populate('fromUser', 'name email city description skillsOffered skillsWanted rating')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: rows.map(r => ({ _id: r._id, status: r.status, createdAt: r.createdAt, from: flat(r.fromUser) })) });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getSentRequests = async (req, res) => {
    try {
        const rows = await SwapRequest.find({ fromUser: req.user.id })
            .populate('toUser', 'name email city description skillsOffered skillsWanted rating')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: rows.map(r => ({ _id: r._id, status: r.status, createdAt: r.createdAt, to: flat(r.toUser) })) });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getRequests, getSentRequests };