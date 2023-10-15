import express from 'express';
import {
  getComments,
  addComment,
  editComment,
  likeOrUnlikeComment,
  deleteComment,
} from '../controllers/comment.controller';

const router = express.Router();

router.get('/:postId', getComments);

router.post('/add/:author/:postId', addComment);

router.put('/edit/:author/:commentId', editComment);

router.patch('/like/:userId/:commentId', likeOrUnlikeComment);

router.delete('/delete/:author/:commentId', deleteComment);

export { router as commentRoutes };
