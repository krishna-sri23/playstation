import { Router } from 'express';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import followRoutes from './followRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/follows', followRoutes);

export default router;
