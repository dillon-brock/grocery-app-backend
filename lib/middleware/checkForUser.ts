import { type NextFunction, type Response } from 'express';
import { AuthenticatedRequest } from '../../types.js';
import jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../types/errorTypes.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies[process.env.COOKIE_NAME];
    if (!cookie) req.user = null;
    else {
      const user: jwt.JwtPayload | string = jwt.verify(cookie, process.env.JWT_SECRET);
      if (typeof user == 'string') throw new ErrorWithStatus('User cannot be verified', 500);
      else req.user = user;
    }
  } catch (e) {
    next(e);
  }
};
