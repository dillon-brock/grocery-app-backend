import { type NextFunction, type Response } from 'express';
import { AuthenticatedRequest } from '../../types.js';
import jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../types/errorTypes.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
  const authHeader = req.get("Authorization");
    if (!authHeader) {
      req.user = null;
      next();
    }
    else {
      const token = authHeader.split(' ')[1];
      if (!token) throw new ErrorWithStatus('Invalid token', 500);

      let decodedToken: jwt.JwtPayload | string;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      }
      catch (e) {
        let message = 'Could not decode token';
        if (e instanceof Error) message = e.message;
        throw new ErrorWithStatus(message, 500);
      }
      if (typeof decodedToken == 'string') throw new ErrorWithStatus('User cannot be verified', 500);
      else req.user = decodedToken;
      next();
    }
  } catch (e) {
    next(e);
  }
};
