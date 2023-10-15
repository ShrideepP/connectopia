import express from 'express';
import { multerUploads } from '../middlewares/multerUpload';
import {
  getAllPosts,
  getAuthorPosts,
  getSavedPosts,
  savePost,
  createPost,
  editPost,
  likeOrUnlikePost,
  deletePost,
} from '../controllers/post.controller';

const router = express.Router();

router.get('/feed', getAllPosts);

router.get('/:author', getAuthorPosts);

router.get('/saved/:userId', getSavedPosts);

router.patch('/save/:userId/:postId', savePost);

router.post('/create/:author', multerUploads, createPost);

router.put('/edit/:author/:postId', editPost);

router.patch('/like/:userId/:postId', likeOrUnlikePost);

router.delete('/delete/:author/:postId', deletePost);

export { router as postRoutes };
