const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUsers } = require('../controllers/messageController');

router.post('/message', sendMessage);
router.get('/message/:conversationId', getMessages);
router.get('/users/:userId', getUsers);

module.exports = router;