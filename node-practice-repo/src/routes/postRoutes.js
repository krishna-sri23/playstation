import { Router } from 'express';
import postController from '../controllers/postController.js';

const router = Router();

router.post('/:userId', postController.create);
router.get('/feed/:userId', postController.getFeed);
router.get('/:id', postController.getById);
router.get('/user/:userId', postController.getByUser);
router.put('/:id/user/:userId', postController.update);
router.delete('/:id/user/:userId', postController.remove);

export default router;
