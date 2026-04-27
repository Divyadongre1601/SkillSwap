const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const jwt        = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./configurations/db');
const Message   = require('./models/Message');
connectDB();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

io.use((socket, next) => {
    try {
        const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch { next(new Error('Invalid token')); }
});

const online = new Map();

io.on('connection', socket => {
    const userId = socket.userId;
    online.set(userId, socket.id);
    io.emit('online_users', Array.from(online.keys()));

    socket.on('join_room', ({ otherUserId }) => {
        const roomId = [userId, otherUserId].sort().join('_');
        socket.join(roomId);
    });

    socket.on('send_message', async ({ receiverId, text }) => {
        if (!receiverId || !text?.trim()) return;
        const roomId = [userId, receiverId].sort().join('_');
        try {
            const msg = await Message.create({ roomId, sender: userId, receiver: receiverId, text: text.trim() });
            io.to(roomId).emit('receive_message', {
                _id: msg._id, roomId: msg.roomId, sender: msg.sender,
                receiver: msg.receiver, text: msg.text, read: msg.read, createdAt: msg.createdAt,
            });
            const recvSocket = online.get(receiverId);
            if (recvSocket) io.to(recvSocket).emit('new_message_notification', { from: userId, text: text.trim() });
        } catch (err) { socket.emit('error', { message: err.message }); }
    });

    socket.on('mark_read', async ({ roomId }) => {
        try {
            await Message.updateMany({ roomId, receiver: userId, read: false }, { read: true });
            io.to(roomId).emit('messages_read', { roomId });
        } catch (err) { console.error('mark_read error:', err.message); }
    });

    socket.on('typing',      ({ receiverId }) => { const r = [userId, receiverId].sort().join('_'); socket.to(r).emit('user_typing',      { userId }); });
    socket.on('stop_typing', ({ receiverId }) => { const r = [userId, receiverId].sort().join('_'); socket.to(r).emit('user_stop_typing', { userId }); });

    socket.on('disconnect', () => {
        online.delete(userId);
        io.emit('online_users', Array.from(online.keys()));
    });
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/swap',  require('./routes/swapRoutes'));
app.use('/api/chat',  require('./routes/chatRoutes'));
app.use('/api/ai',    require('./routes/aiRoutes'));
app.use('/api/trust', require('./routes/trustRoutes'));   // ← NEW

app.get('/', (_, res) => res.json({ status: 'ok', message: 'SkillSwap API running' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Server error' }); });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`SkillSwap API + Socket.io → http://localhost:${PORT}`));