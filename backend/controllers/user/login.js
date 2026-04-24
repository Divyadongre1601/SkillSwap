const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                _id:           user._id,
                name:          user.name,
                email:         user.email,
                city:          user.city,
                description:   user.description,
                skillsOffered: user.skillsOffered,
                skillsWanted:  user.skillsWanted,
                rating:        user.rating.average,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = login;