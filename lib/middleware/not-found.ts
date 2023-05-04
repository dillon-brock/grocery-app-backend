import { type Request, type Response, type NextFunction } from 'express';
import { ErrorWithStatus } from '../types/error.js';

export default (req: Request, res: Response, next: NextFunction) => {
  const err = new ErrorWithStatus('Not Found', 404);
  next(err);
};
