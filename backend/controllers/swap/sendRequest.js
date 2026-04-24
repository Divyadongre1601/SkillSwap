const SwapRequest = require('../../models/SwapRequest');
const User = require('../../models/User');

const sendRequest = async (req, res) => {
    try {
        const { toUserId } = req.body;
        if (!toUserId)              return res.status(400).json({ message: 'toUserId required' });
        if (req.user.id === toUserId) return res.status(400).json({ message: 'Cannot send request to yourself' });

        const target = await User.findById(toUserId).select('name');
        if (!target)                return res.status(404).json({ message: 'User not found' });

        const existing = await SwapRequest.findOne({
            fromUser: req.user.id, toUser: toUserId, status: { $in: ['pending','accepted'] }
        });
        if (existing) return res.status(400).json({ message: 'Request already sent' });

        const reverse = await SwapRequest.findOne({ fromUser: toUserId, toUser: req.user.id, status: 'pending' });
        if (reverse)  return res.status(400).json({ message: `${target.name} already sent you a request — check incoming requests` });

        const request = await SwapRequest.create({ fromUser: req.user.id, toUser: toUserId });

        res.status(201).json({ success: true, message: `Request sent to ${target.name}`, data: request });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Request already exists' });
        res.status(500).json({ error: err.message });
    }
};

module.exports = sendRequest;