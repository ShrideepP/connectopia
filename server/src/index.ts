import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { postRoutes } from './routes/post';
import { commentRoutes } from './routes/comment';
import { cloudinaryConfig } from './config/cloudinaryConfig';

const app = express();

app.use(cors());
app.use(express.json());
app.use('*', cloudinaryConfig);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    app.listen(8000, () => {
      console.log(
        'Database connected successfully and server started on PORT: 8000',
      );
    });
  })
  .catch(() => {
    console.log('Oops! something went wrong while connecting to the database');
  });
