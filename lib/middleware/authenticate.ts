import { type NextFunction, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../types/error.js';
import { AuthenticatedRequest } from '../types/extendedExpress.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      if (req.path == '/me') {
        req.user = null;
        next();
      }
      else {
        throw new ErrorWithStatus('You must be signed in to continue', 401);
      }
    }
    else {
      const firstTerm = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (!token || firstTerm != 'Bearer') {
        throw new ErrorWithStatus('Invalid token', 401);
      }

      let decodedToken: jwt.JwtPayload | string;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      }
      catch (e) {
        let message = 'Could not decode token';
        if (e instanceof Error) message = e.message;
        throw new ErrorWithStatus(message, 500);
      }

      req.user = decodedToken;
      next();
    }
  } catch (e) {
    next(e);
  }
};
