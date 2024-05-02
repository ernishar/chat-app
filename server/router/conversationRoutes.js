const express = require('express');
const conversationController = require('../controllers/conversationController');

const router = express.Router();

router.post('/conversation', conversationController.createConversation);
router.get('/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await conversationController.getConversationsByUserId(userId);
        res.status(200).json(conversations);
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;