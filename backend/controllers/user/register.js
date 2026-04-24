const User = require('../../models/User');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
        const { name, email, password, city, description, skillsOffered, skillsWanted } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required' });
        if (password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const norm = (arr) => Array.isArray(arr) ? arr.map(s => s.trim()).filter(Boolean) : [];

        const user = await User.create({
            name:          name.trim(),
            email:         email.toLowerCase().trim(),
            password:      await bcrypt.hash(password, 10),
            city:          city        ? city.trim()        : '',
            description:   description ? description.trim() : '',
            skillsOffered: norm(skillsOffered),
            skillsWanted:  norm(skillsWanted),
        });

        res.status(201).json({ message: 'Account created successfully', userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = register;