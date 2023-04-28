import { type Response, type NextFunction } from 'express';
import { ErrorWithStatus } from '../types/errorTypes.js';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../types.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies[process.env.COOKIE_NAME];

    if (!cookie) throw new ErrorWithStatus('You must be signed in to continue', 401);

    const user: jwt.JwtPayload | string = jwt.verify(cookie, process.env.JWT_SECRET);
    if (typeof user == 'string') throw new ErrorWithStatus('User cannot be verified', 500);
    else req.user = user;
  } catch (e) {
    next(e);
  }
};
