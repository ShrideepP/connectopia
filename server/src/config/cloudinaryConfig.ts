import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';

const { config, uploader } = cloudinary;

const cloudinaryConfig = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  next();
};

export { cloudinaryConfig, uploader };
