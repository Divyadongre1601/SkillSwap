const User = require('../../models/User');

const rateUser = async (req, res) => {
    try {
        const { userId, rating } = req.body;
        const r = parseFloat(rating);

        if (!userId)            return res.status(400).json({ message: 'userId required' });
        if (isNaN(r) || r < 1 || r > 5)
                                return res.status(400).json({ message: 'Rating must be 1–5' });
        if (req.user.id === userId)
                                return res.status(400).json({ message: 'Cannot rate yourself' });

        const target = await User.findById(userId);
        if (!target)            return res.status(404).json({ message: 'User not found' });

        // Prevent double-rating
        const alreadyRated = target.ratedBy.some(id => id.toString() === req.user.id);
        if (alreadyRated)       return res.status(400).json({ message: 'You have already rated this user' });

        const prev  = target.rating.average ?? 0;
        const count = target.rating.count   ?? 0;
        const newCount = count + 1;
        const newAvg   = parseFloat(((prev * count + r) / newCount).toFixed(2));

        target.rating  = { average: newAvg, count: newCount };
        target.ratedBy.push(req.user.id);
        await target.save();

        res.json({ message: 'Rating saved', rating: newAvg, count: newCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = rateUser;