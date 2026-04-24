const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // roomId = sorted pair of user IDs joined by '_' e.g. "uid1_uid2"
    roomId:   { type: String, required: true, index: true },
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:     { type: String, required: true, trim: true, maxlength: 2000 },
    read:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);