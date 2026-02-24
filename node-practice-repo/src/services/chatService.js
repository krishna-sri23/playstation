import { User, Chat, Message } from '../models/index.js';
import redisClient from '../config/redis.js';
import { Op } from 'sequelize';

const setUserStatus = async (userId, status) => {
  await User.update({ status }, { where: { id: userId } });
};

const startChat = async (user1Id, user2Id) => {
  const chat = await Chat.create({ user1Id, user2Id });
  const sessionId = chat.sessionId;

  // Store session info in Redis
  await redisClient.hSet(`chat:${sessionId}:info`, {
    chatId: chat.id.toString(),
    user1Id: user1Id.toString(),
    user2Id: user2Id.toString(),
    startedAt: new Date().toISOString()
  });

  return { sessionId, chatId: chat.id };
};

const sendMessage = async (sessionId, senderId, content) => {
  const timestamp = new Date().toISOString();
  const message = JSON.stringify({ senderId, content, timestamp });

  await redisClient.rPush(`chat:${sessionId}:messages`, message);

  return { senderId, content, timestamp };
};

const endChat = async (sessionId) => {
  // Get chat info from Redis
  const info = await redisClient.hGetAll(`chat:${sessionId}:info`);
  if (!info || !info.chatId) {
    throw new Error('Chat session not found');
  }

  // Get all messages from Redis
  const rawMessages = await redisClient.lRange(`chat:${sessionId}:messages`, 0, -1);
  const messages = rawMessages.map(msg => JSON.parse(msg));

  // Flush messages to MySQL
  if (messages.length > 0) {
    const bulkData = messages.map(msg => ({
      chatId: parseInt(info.chatId),
      senderId: parseInt(msg.senderId),
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    }));
    await Message.bulkCreate(bulkData);
  }

  // Close the chat in MySQL
  await Chat.update({ status: 'closed' }, { where: { sessionId } });

  // Delete Redis keys
  await redisClient.del(`chat:${sessionId}:info`);
  await redisClient.del(`chat:${sessionId}:messages`);

  return { chatId: parseInt(info.chatId), messageCount: messages.length };
};

const getActiveMessages = async (sessionId) => {
  const rawMessages = await redisClient.lRange(`chat:${sessionId}:messages`, 0, -1);
  return rawMessages.map(msg => JSON.parse(msg));
};

const getChatHistory = async (chatId) => {
  const messages = await Message.findAll({
    where: { chatId },
    order: [['timestamp', 'ASC']],
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'name']
    }]
  });
  return messages;
};

const getUserChats = async (userId) => {
  const chats = await Chat.findAll({
    where: {
      [Op.or]: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    },
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'user1', attributes: ['id', 'name', 'status'] },
      { model: User, as: 'user2', attributes: ['id', 'name', 'status'] }
    ]
  });
  return chats;
};

const chatService = {
  setUserStatus,
  startChat,
  sendMessage,
  endChat,
  getActiveMessages,
  getChatHistory,
  getUserChats
};

export default chatService;
