import postService from '../services/postService.js';

const create = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'content is required' });
        }
        const post = await postService.createPost(req.params.userId, req.body);
        return res.status(201).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const post = await postService.getPostById(req.params.id);
        return res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

const getByUser = async (req, res, next) => {
    try {
        const posts = await postService.getPostsByUser(req.params.userId);
        return res.status(200).json({ success: true, data: posts });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const post = await postService.updatePost(req.params.id, req.params.userId, req.body);
        return res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await postService.deletePost(req.params.id, req.params.userId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getFeed = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await postService.getFeed(req.params.userId, page, limit);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const postController = { create, getById, getByUser, update, remove, getFeed };
export default postController;
