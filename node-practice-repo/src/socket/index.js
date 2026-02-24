import { Server } from 'socket.io';
import chatService from '../services/chatService.js';

// Parse data that may arrive as a JSON string or object (e.g. from Postman)
function parse(data) {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return data; }
  }
  return data;
}

// Map of userId -> socketId for routing
const userSocketMap = new Map();

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User comes online
    socket.on('user-online', async (userId) => {
      try {
        userSocketMap.set(String(userId), socket.id);
        socket.userId = String(userId);

        // Join personal room
        socket.join(`user:${userId}`);

        // Mark user online in DB
        await chatService.setUserStatus(userId, 'online');

        // Broadcast status change
        io.emit('user-status-changed', { userId, status: 'online' });
        console.log(`User ${userId} is online (socket: ${socket.id})`);
      } catch (err) {
        console.error('user-online error:', err.message);
        socket.emit('error', { message: 'Failed to set online status' });
      }
    });

    // Start a chat between two users
    socket.on('start-chat', async (raw) => {
      const { user1Id, user2Id } = parse(raw);
      try {
        const { sessionId, chatId } = await chatService.startChat(user1Id, x);
        const chatRoom = `chat:${sessionId}`;

        // Join initiator to the chat room
        socket.join(chatRoom);

        // Join the other user if they're online
        const user2SocketId = userSocketMap.get(String(user2Id));
        if (user2SocketId) {
          const user2Socket = io.sockets.sockets.get(user2SocketId);
          if (user2Socket) {
            user2Socket.join(chatRoom);
          }
        }

        // Notify both users
        io.to(`user:${user1Id}`).emit('chat-started', { sessionId, chatId, withUserId: user2Id });
        io.to(`user:${user2Id}`).emit('chat-started', { sessionId, chatId, withUserId: user1Id });

        console.log(`Chat started: ${sessionId} between ${user1Id} and ${user2Id}`);
      } catch (err) {
        console.error('start-chat error:', err.message);
        socket.emit('error', { message: 'Failed to start chat' });
      }
    });

    // Send a message
    socket.on('send-message', async (raw) => {
      const { sessionId, senderId, content } = parse(raw);
      try {
        const message = await chatService.sendMessage(sessionId, senderId, content);

        // Emit to the chat room
        io.to(`chat:${sessionId}`).emit('receive-message', {
          sessionId,
          senderId: message.senderId,
          content: message.content,
          timestamp: message.timestamp
        });
      } catch (err) {
        console.error('send-message error:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // End a chat session — flush Redis to MySQL
    socket.on('end-chat', async (raw) => {
      const { sessionId } = parse(raw);
      try {
        const { chatId, messageCount } = await chatService.endChat(sessionId);

        // Notify both users in the chat room
        io.to(`chat:${sessionId}`).emit('chat-ended', { sessionId, chatId, messageCount });

        // Remove all sockets from the chat room
        const room = io.sockets.adapter.rooms.get(`chat:${sessionId}`);
        if (room) {
          for (const socketId of room) {
            const s = io.sockets.sockets.get(socketId);
            if (s) s.leave(`chat:${sessionId}`);
          }
        }

        console.log(`Chat ended: ${sessionId}, ${messageCount} messages flushed`);
      } catch (err) {
        console.error('end-chat error:', err.message);
        socket.emit('error', { message: 'Failed to end chat' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userId = socket.userId;
      if (userId) {
        userSocketMap.delete(userId);
        try {
          await chatService.setUserStatus(userId, 'offline');
          io.emit('user-status-changed', { userId, status: 'offline' });
        } catch (err) {
          console.error('disconnect status update error:', err.message);
        }
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  return io;
}
