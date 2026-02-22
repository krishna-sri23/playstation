import { Router } from 'express';
import followController from '../controllers/followController.js';

const router = Router();

router.post('/', followController.follow);
router.post('/unfollow', followController.unfollow);
router.get('/:userId/followers', followController.getFollowers);
router.get('/:userId/followings', followController.getFollowings);

export default router;
