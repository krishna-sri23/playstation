import User from './user.js';
import Chat from './chat.js';
import Message from './message.js';

// Associations
Chat.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Chat.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });

Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

export { User, Chat, Message };
