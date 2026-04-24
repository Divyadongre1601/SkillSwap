const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:   { type: String, enum: ['pending','accepted','rejected','cancelled'], default: 'pending' }
}, { timestamps: true });

swapRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);