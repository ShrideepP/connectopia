import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      _id?: string;
    }
  }
}

export async function verifyToken(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];
  const refreshToken: string = request.body.refreshToken;

  if (!accessToken && !refreshToken)
    return response.status(400).send('Access denied, no token was provided.');

  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;
      request._id = decoded._id;
      next();
    } catch (error) {
      return response.status(403).send('Invalid or expired access token.');
    }
  } else {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
      ) as JwtPayload;
      request._id = decoded._id;
      next();
    } catch (error) {
      return response.status(403).send('Invalid or expired refresh token.');
    }
  }
}
