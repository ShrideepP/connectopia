import express from 'express';

import { signup, signin, refreshToken } from '../controllers/auth.controller';
import { multerUploads } from '../middlewares/multerUpload';

const router = express.Router();

router.post('/signup', multerUploads, signup);

router.post('/signin', signin);

router.post('/refreshToken', refreshToken);

export { router as authRoutes };
