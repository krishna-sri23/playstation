import userService from '../services/userService.js';
import { AppError } from '../middlewares/errorHandler.js';

const register = async (req, res, next) => {
    try {
        const { name, email, password, username, bio } = req.body;
        if (!name || !email || !password || !username) {
            return res.status(400).json({ error: 'name, email, username and password are required' });
        }
        const user = await userService.register(req.body);
        return res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }
        const user = await userService.login(email, password);
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.params.id, req.body);
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const userController = { register, login, updateProfile };
export default userController;
