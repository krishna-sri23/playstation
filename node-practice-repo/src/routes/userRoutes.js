import { Router } from 'express';
import userController from '../controllers/userController.js';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', userController.listUsers);
router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);

export default router;
