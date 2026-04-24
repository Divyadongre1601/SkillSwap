const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');

const sendRequest   = require('../controllers/swap/sendRequest');
const updateRequest = require('../controllers/swap/updateRequest');
const { getRequests, getSentRequests } = require('../controllers/swap/getRequests');

router.post('/send',    protect, sendRequest);
router.put('/update',   protect, updateRequest);
router.get('/requests', protect, getRequests);      // incoming ?status=pending|accepted|rejected
router.get('/sent',     protect, getSentRequests);  // outgoing

module.exports = router;