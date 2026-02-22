import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User',{

  id:{
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  username:{
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email:{
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name:{
    type: DataTypes.STRING(100),
    allowNull: false
  },
  password:{
    type: DataTypes.STRING(255),
    allowNull: false
  },
  bio:{
    type: DataTypes.STRING(255),
    defaultValue: ''
  }},
  {
    tableName : 'user',
    timestamps: true,
    indexes:[
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      }
    ],
});

export default User;