const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const moment = require('moment');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Store connected users and rooms
const users = new Map();
const rooms = new Map();
const messageHistory = new Map(); // Store last 50 messages per room

// Bot messages
const botName = 'ChatBot';

// Helper functions
function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a'),
        id: Date.now() + Math.random().toString(36).substr(2, 9)
    };
}

function getRoomUsers(room) {
    return Array.from(users.values()).filter(user => user.room === room);
}

function storeMessage(room, message) {
    if (!messageHistory.has(room)) {
        messageHistory.set(room, []);
    }
    const history = messageHistory.get(room);
    history.push(message);
    // Keep only last 50 messages
    if (history.length > 50) {
        history.shift();
    }
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    // Join room
    socket.on('join', ({ username, room }, callback) => {
        // Validate input
        username = username.trim().toLowerCase();
        room = room.trim().toLowerCase();

        if (!username || !room) {
            return callback('Username and room are required!');
        }

        // Check for existing user in room
        const existingUser = Array.from(users.values()).find(
            user => user.room === room && user.username === username
        );

        if (existingUser) {
            return callback('Username is already taken in this room!');
        }

        // Create user
        const user = {
            id: socket.id,
            username,
            room,
            isTyping: false
        };

        users.set(socket.id, user);

        // Join room
        socket.join(room);

        // Send welcome message to user
        socket.emit('message', formatMessage(botName, `Welcome to ${room}, ${username}! 👋`));

        // Broadcast when a user connects
        socket.broadcast.to(room).emit(
            'message', 
            formatMessage(botName, `${username} has joined the chat!`)
        );

        // Send room info
        io.to(room).emit('roomData', {
            room: room,
            users: getRoomUsers(room)
        });

        // Send message history
        if (messageHistory.has(room)) {
            socket.emit('messageHistory', messageHistory.get(room));
        }

        callback();
    });

    // Handle chat message
    socket.on('chatMessage', (msg, callback) => {
        const user = users.get(socket.id);
        
        if (!user) {
            return callback('User not found!');
        }

        // Filter bad words
        const filter = new Filter();
        const cleanMsg = filter.clean(msg);

        const message = formatMessage(user.username, cleanMsg);
        
        // Store and broadcast message
        storeMessage(user.room, message);
        io.to(user.room).emit('message', message);

        callback();
    });

    // Handle typing indicator
    socket.on('typing', (isTyping) => {
        const user = users.get(socket.id);
        if (user) {
            user.isTyping = isTyping;
            socket.broadcast.to(user.room).emit('userTyping', {
                username: user.username,
                isTyping
            });
        }
    });

    // Handle private message
    socket.on('privateMessage', ({ toUserId, text }, callback) => {
        const fromUser = users.get(socket.id);
        const toUser = Array.from(users.values()).find(u => u.username === toUserId);
        
        if (!fromUser || !toUser) {
            return callback('User not found!');
        }

        const message = formatMessage(fromUser.username, `(Private) ${text}`);
        
        // Send to both users
        socket.emit('privateMessage', { ...message, to: toUser.username });
        io.to(toUser.id).emit('privateMessage', { ...message, from: fromUser.username });

        callback();
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        
        if (user) {
            // Notify room
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat! 👋`)
            );

            // Update room users
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

            // Remove user
            users.delete(socket.id);
            
            console.log(`${user.username} disconnected from ${user.room}`);
        }
    });
});

// API endpoints
app.get('/api/rooms', (req, res) => {
    const activeRooms = Array.from(new Set(Array.from(users.values()).map(u => u.room)));
    res.json({ rooms: activeRooms, count: activeRooms.length });
});

app.get('/api/room/:room/users', (req, res) => {
    const roomUsers = getRoomUsers(req.params.room);
    res.json({ users: roomUsers, count: roomUsers.length });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
});