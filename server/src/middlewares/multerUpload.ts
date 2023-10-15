import { Request } from 'express';
import multer from 'multer';
import DatauriParser from 'datauri/parser.js';
import path from 'path';

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');

const parser = new DatauriParser();
const dataUri = (request: Request): string | undefined => {
  if (!request.file) return undefined;
  return parser.format(
    path.extname(request.file.originalname).toString(),
    request.file.buffer,
  ).content;
};

export { multerUploads, dataUri };
