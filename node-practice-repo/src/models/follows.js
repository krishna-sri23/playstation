import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Follow = sequelize.define('Follow',{

  id:{
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  follower_id:{
    type: DataTypes.BIGINT,
    allowNull: false,
    references:{
        model: 'user',
        key: 'id'
    }
  },
  following_id:{
    type: DataTypes.BIGINT,
    allowNull: false,
    references:{
        model:'user',
        key: 'id'
    }
  },
  is_deleted:{
    type: DataTypes.TINYINT,
    defaultValue: 0
  }},
  {
    tableName : 'follow',
    timestamps: true,
    indexes:[
      {
        unique: true,
        fields: ['follower_id','following_id']
      },
      {
        fields: ['following_id','is_deleted']
      },
      {
        fields: ['follower_id','is_deleted']
      }
    ]
});

export default Follow;   