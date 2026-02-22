import User from './user.js';
import Post from './post.js';
import Follow from './follows.js';

User.hasMany(Post,{foreignKey:'user_id', as: 'posts'});
Post.belongsTo(User, {foreignKey: 'user_id', as: 'author'});

User.hasMany(Follow,{foreignKey: 'follower_id', as: 'followings'});
User.hasMany(Follow,{foreignKey: 'following_id', as: 'followers'});
Follow.belongsTo(User,{foreignKey: 'follower_id', as: 'Follower_user'});
Follow.belongsTo(User,{foreignKey: 'following_id', as: 'Following_user'});

export { 
    User,
    Post,
    Follow };


