// controllers/messageController.js
const { sequelize } = require('../db/connection');

const sendMessage = async (req, res) => {
    try {
      const { conversationId, senderId, message, receiverId = '' } = req.body;
      if (!senderId || !message) return res.status(400).send('Please fill all required fields');
  
      let newConversationId;
      if (conversationId === 'new' && receiverId) {
        const [newConversation] = await sequelize.query(
          `INSERT INTO Conversations (members) VALUES ('[${senderId}, ${receiverId}]')`
        );
        newConversationId = newConversation.insertId;
      } else if (!conversationId && !receiverId) {
        return res.status(400).send('Please fill all required fields');
      } else {
        newConversationId = conversationId;
      }
  
      await sequelize.query(
        `INSERT INTO Messages (conversationId, senderId, message) VALUES (${newConversationId}, ${senderId}, '${message}')`
      );
  
      res.status(200).send('Message sent successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  const getMessages = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await sequelize.query(
        `SELECT Messages.message, Users.id, Users.email, Users.fullName FROM Messages 
        INNER JOIN Users ON Messages.senderId = Users.id WHERE Messages.conversationId = ${conversationId}`
      );
      res.status(200).json(messages[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  const getUsers = async (req, res) => {
    try {
      const { userId } = req.params;
      const users = await sequelize.query(
        `SELECT id, email, fullName FROM Users WHERE id != ${userId}`
      );
      res.status(200).json(users[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  module.exports = { sendMessage, getMessages, getUsers };
  