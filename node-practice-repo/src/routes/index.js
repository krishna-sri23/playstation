import { Router } from 'express';
import userRoutes from './userRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/chats', chatRoutes);

export default router;
