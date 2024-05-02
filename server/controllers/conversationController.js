
const sequelize = require('../db/connection');

const createConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = await sequelize.query(`
            INSERT INTO Conversations (members)
            VALUES (:members)
        `, {
            replacements: { members: [senderId, receiverId] }
        });
        res.status(200).send('Conversation created successfully',newConversation);
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
};

const getConversationsByUserId = async (userId) => {
    try {
        const conversations = await sequelize.query(`
            SELECT c.id as conversationId, u.id as receiverId, u.email, u.fullName
            FROM Conversations c
            INNER JOIN Users u ON (c.members[1] = u.id OR c.members[2] = u.id)
            WHERE c.members @> ARRAY[:userId]::uuid[]
        `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });
        return conversations;
    } catch (error) {
        console.log(error, 'Error');
        throw new Error('Internal Server Error');
    }
};

module.exports = {
    createConversation,
    getConversationsByUserId
};
