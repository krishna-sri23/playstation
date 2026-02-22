import { Op } from 'sequelize';
import { Post, User, Follow } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';

const createPost = async (userId, data) => {
    const post = await Post.create({
        user_id: userId,
        content: data.content,
    });
    return post;
};

const getPostById = async (id) => {
    const post = await Post.findOne({
        where: { id, is_deleted: 0 },
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username'] }],
    });
    if (!post) throw new AppError('Post not found', 404);
    return post;
};

const getPostsByUser = async (userId) => {
    const posts = await Post.findAll({
        where: { user_id: userId, is_deleted: 0 },
        order: [['createdAt', 'DESC']],
    });
    return posts;
};

const updatePost = async (id, userId, data) => {
    const post = await Post.findOne({ where: { id, user_id: userId, is_deleted: 0 } });
    if (!post) throw new AppError('Post not found', 404);
    await post.update({ content: data.content });
    return post;
};

const deletePost = async (id, userId) => {
    const post = await Post.findOne({ where: { id, user_id: userId, is_deleted: 0 } });
    if (!post) throw new AppError('Post not found', 404);
    await post.update({ is_deleted: 1 });
    return { message: 'Post deleted successfully' };
};

const getFeed = async (userId, page = 1, limit = 10) => {
    const follows = await Follow.findAll({
        where: { follower_id: userId, is_deleted: 0 },
        attributes: ['following_id'],
    });

    const followingIds = follows.map(f => f.following_id);

    const { count, rows } = await Post.findAndCountAll({
        where: {
            user_id: { [Op.in]: followingIds },
            is_deleted: 0
        },
        include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'name']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit
    });

    return {
        posts: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
    };
};

const postService = { createPost, getPostById, getPostsByUser, updatePost, deletePost, getFeed };
export default postService;
