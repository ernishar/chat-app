const { sequelize } = require('../db/connection');

let users = [];

io.on('connection', socket => {
    console.log('User connected', socket.id);

    socket.on('addUser', async userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);

        try {
            const [user] = await sequelize.query(`SELECT * FROM Users WHERE id = ${senderId}`);
            console.log('sender :>> ', sender, receiver);
            if (receiver) {
                io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                    senderId,
                    message,
                    conversationId,
                    receiverId,
                    user: { id: user.id, fullName: user.fullName, email: user.email }
                });
            } else {
                io.to(sender.socketId).emit('getMessage', {
                    senderId,
                    message,
                    conversationId,
                    receiverId,
                    user: { id: user.id, fullName: user.fullName, email: user.email }
                });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
});

module.exports = io;
