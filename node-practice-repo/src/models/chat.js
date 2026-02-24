import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/db.js';

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.UUID,
    unique: true,
    defaultValue: () => uuidv4()
  },
  user1Id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  user2Id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'closed'),
    defaultValue: 'active'
  }
}, {
  tableName: 'chat',
  timestamps: true
});

export default Chat;
