const SwapRequest = require('../../models/SwapRequest');
 
const getSentRequests = async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            fromUser: req.user.id
        })
        .populate('toUser', 'name email city description skillsOffered skillsWanted rating')
        .sort({ createdAt: -1 });
 
        const data = requests.map((r) => ({
            _id:       r._id,
            status:    r.status,
            createdAt: r.createdAt,
            to: {
                _id:           r.toUser._id,
                name:          r.toUser.name,
                email:         r.toUser.email,
                city:          r.toUser.city,
                description:   r.toUser.description,
                skillsOffered: r.toUser.skillsOffered,
                skillsWanted:  r.toUser.skillsWanted,
                rating:        r.toUser.rating?.average ?? 0,
            }
        }));
 
        res.json({ success: true, data });
 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
 
module.exports = getSentRequests;