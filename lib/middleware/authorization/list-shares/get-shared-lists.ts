import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.query.userId != req.user.id) {
      throw new ErrorWithStatus('You are not authorized to view this information', 403);
    }
    next();
  } catch (e) {
    next(e);
  }
};
