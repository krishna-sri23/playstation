import { Router } from 'express';
import chatController from '../controllers/chatController.js';

const router = Router();

// GET /api/chats/user/:userId — Get all chats for a user
router.get('/user/:userId', chatController.getUserChats);

// GET /api/chats/:chatId/history — Get messages from MySQL (closed sessions)
router.get('/:chatId/history', chatController.getChatHistory);

// GET /api/chats/:sessionId/messages — Get messages from Redis (active sessions)
router.get('/:sessionId/messages', chatController.getActiveMessages);

export default router;
