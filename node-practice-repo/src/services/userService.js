import { User } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';

const register = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
};

const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid password', 401);

    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
};

const getProfile = async (id) => {
    const cacheKey = `user:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw new AppError('User not found', 404);

    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    return user;
};

const listUsers = async (page = 1, limit = 10) => {
    const { count, rows } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
    });
    return {
        users: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
    };
};

const updateProfile = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found', 404);
    await user.update(data);
    const { password, ...userWithoutPassword } = user.toJSON();

    const cacheKey = `user:${id}`;
    await redisClient.set(cacheKey, JSON.stringify(userWithoutPassword), { EX: 3600 });
    return userWithoutPassword;
};

const userService = { register, login, getProfile, listUsers, updateProfile };
export default userService;
