import { Follow, User } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';

const follow = async (followerId, followingId) => {
    if (followerId === followingId) throw new AppError('Cannot follow yourself', 400);

    const existing = await Follow.findOne({
        where: { follower_id: followerId, following_id: followingId },
    });

    if (existing && existing.is_deleted === 0) {
        throw new AppError('Already following this user', 409);
    }

    if (existing && existing.is_deleted === 1) {
        await existing.update({ is_deleted: 0 });
        return { message: 'Followed successfully' };
    }

    await Follow.create({ follower_id: followerId, following_id: followingId });
    return { message: 'Followed successfully' };
};

const unfollow = async (followerId, followingId) => {
    const existing = await Follow.findOne({
        where: { follower_id: followerId, following_id: followingId, is_deleted: 0 },
    });
    if (!existing) throw new AppError('Not following this user', 400);

    await existing.update({ is_deleted: 1 });
    return { message: 'Unfollowed successfully' };
};

const getFollowers = async (userId) => {
    const followers = await Follow.findAll({
        where: { following_id: userId, is_deleted: 0 },
        include: [{ model: User, as: 'Follower_user', attributes: ['id', 'name', 'username'] }],
    });
    return followers.map(f => f.Follower_user);
};

const getFollowings = async (userId) => {
    const followings = await Follow.findAll({
        where: { follower_id: userId, is_deleted: 0 },
        include: [{ model: User, as: 'Following_user', attributes: ['id', 'name', 'username'] }],
    });
    return followings.map(f => f.Following_user);
};

const followService = { follow, unfollow, getFollowers, getFollowings };
export default followService;
