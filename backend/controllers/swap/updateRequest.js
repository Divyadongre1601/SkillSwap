const SwapRequest = require('../../models/SwapRequest');

const updateRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        if (!requestId || !status) return res.status(400).json({ message: 'requestId and status required' });
        if (!['accepted','rejected','cancelled'].includes(status))
            return res.status(400).json({ message: 'Invalid status' });

        const request = await SwapRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ message: `Request already ${request.status}` });

        const isReceiver = request.toUser.toString()   === req.user.id;
        const isSender   = request.fromUser.toString() === req.user.id;

        if (status === 'cancelled' && !isSender)   return res.status(403).json({ message: 'Only sender can cancel' });
        if (['accepted','rejected'].includes(status) && !isReceiver)
            return res.status(403).json({ message: 'Only receiver can accept/reject' });

        request.status = status;
        await request.save();
        res.json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = updateRequest;