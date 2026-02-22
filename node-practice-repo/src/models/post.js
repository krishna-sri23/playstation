import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Post = sequelize.define('Post',{

  id:{
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id:{
    type: DataTypes.BIGINT,
    allowNull: false
  },
  content:{
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_deleted:{
    type: DataTypes.TINYINT,
    defaultValue: 0
  }},
  {
    tableName : 'post',
    timestamps: true,
    indexes:[
      {
        fields: ['user_id','createdAt']
      },
      {
        fields: ['is_deleted']
      }
    ]
});

export default Post;