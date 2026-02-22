import { Follow, User } from '../models/index.js';
import bcrypt from 'bcrypt';

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
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw new AppError('User not found', 404);

    const followersCount = await Follow.count({
        where:{
            following_id : id
        }
    });
    const followingsCount = await Follow.count({
        where:{
            follower_id : id
        }
    });
    return {
        ...user.toJSON(),
        followersCount,
        followingsCount
    };
};

const updateProfile = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found', 404);
    await user.update(data);
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
};

const userService = { register, login, getProfile, updateProfile };                                                                                                                                                                          
export default userService;