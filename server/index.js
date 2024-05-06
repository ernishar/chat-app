const express = require('express');
const cors = require('cors');
const http = require('http');
const socketLogic = require('./controllers/socket');
const userRouter = require('./router/userRoutes')
const messageRouter = require('./router/messageRoutes')
const conversationRouter = require('./router/conversationRoutes')


// Connect DB
require('./db/connection');

// app Use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/api',userRouter,messageRouter,conversationRouter)

const port = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Socket.io
socketLogic.attach(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
