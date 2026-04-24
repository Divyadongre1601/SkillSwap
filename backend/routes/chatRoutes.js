const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const { getHistory, getConversations } = require('../controllers/chat/chatController');

router.get('/conversations', protect, getConversations);
router.get('/:userId',       protect, getHistory);

module.exports = router;