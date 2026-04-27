const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true },
    city:        { type: String, default: '' },
    description: { type: String, default: '' },
    skillsOffered: [{ type: String, trim: true }],
    skillsWanted:  [{ type: String, trim: true }],
    rating: {
        average: { type: Number, default: 0 },
        count:   { type: Number, default: 0 }
    },
    ratedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isVerified: { type: Boolean, default: false },   // ← AI Trust Builder
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);