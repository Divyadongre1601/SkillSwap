const User        = require('../../models/User');
const SwapRequest = require('../../models/SwapRequest');
const Message     = require('../../models/Message');

const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete all swap requests involving this user
        await SwapRequest.deleteMany({
            $or: [{ fromUser: userId }, { toUser: userId }]
        });

        // Delete all messages involving this user
        await Message.deleteMany({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = deleteProfile;