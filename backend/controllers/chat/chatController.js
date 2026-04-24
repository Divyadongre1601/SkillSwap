const Message = require('../../models/Message');

// GET /api/chat/:userId — load message history with another user
const getHistory = async (req, res) => {
    try {
        const me    = req.user.id;
        const other = req.params.userId;
        const roomId = [me, other].sort().join('_');

        const messages = await Message.find({ roomId })
            .sort({ createdAt: 1 })
            .lean();

        // Mark incoming messages as read
        await Message.updateMany({ roomId, receiver: me, read: false }, { read: true });

        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/chat/conversations — list of people you've chatted with + last message
const getConversations = async (req, res) => {
    try {
        const me = req.user.id;

        const messages = await Message.find({
            $or: [{ sender: me }, { receiver: me }]
        })
        .sort({ createdAt: -1 })
        .populate('sender receiver', 'name city')
        .lean();

        // Deduplicate by partner
        const seen = new Map();
        for (const msg of messages) {
            const partner = msg.sender._id.toString() === me ? msg.receiver : msg.sender;
            if (!seen.has(partner._id.toString())) {
                seen.set(partner._id.toString(), {
                    partnerId:   partner._id,
                    partnerName: partner.name,
                    lastMessage: msg.text,
                    lastAt:      msg.createdAt,
                    unread:      msg.receiver._id.toString() === me && !msg.read ? 1 : 0,
                });
            } else if (msg.receiver._id.toString() === me && !msg.read) {
                seen.get(partner._id.toString()).unread++;
            }
        }

        res.json({ success: true, data: Array.from(seen.values()) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getHistory, getConversations };