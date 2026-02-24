import chatService from '../services/chatService.js';

const getUserChats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const chats = await chatService.getUserChats(userId);
    return res.json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await chatService.getChatHistory(chatId);
    return res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

const getActiveMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const messages = await chatService.getActiveMessages(sessionId);
    return res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

const chatController = { getUserChats, getChatHistory, getActiveMessages };
export default chatController;
