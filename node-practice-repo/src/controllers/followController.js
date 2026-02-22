import followService from '../services/followService.js';

const follow = async (req, res, next) => {
    try {
        const { followerId, followingId } = req.body;
        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'followerId and followingId are required' });
        }
        const result = await followService.follow(followerId, followingId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const unfollow = async (req, res, next) => {
    try {
        const { followerId, followingId } = req.body;
        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'followerId and followingId are required' });
        }
        const result = await followService.unfollow(followerId, followingId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getFollowers = async (req, res, next) => {
    try {
        const followers = await followService.getFollowers(req.params.userId);
        return res.status(200).json({ success: true, data: followers });
    } catch (error) {
        next(error);
    }
};

const getFollowings = async (req, res, next) => {
    try {
        const followings = await followService.getFollowings(req.params.userId);
        return res.status(200).json({ success: true, data: followings });
    } catch (error) {
        next(error);
    }
};

const followController = { follow, unfollow, getFollowers, getFollowings };
export default followController;
