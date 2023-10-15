import express from 'express';
import {
  followOrUnfollowAccount,
  deleteAccount,
} from '../controllers/user.controller';

const router = express.Router();

router.patch('/follow/:userId/:creatorId', followOrUnfollowAccount);

router.delete('/delete/:userId', deleteAccount);

export { router as userRoutes };
