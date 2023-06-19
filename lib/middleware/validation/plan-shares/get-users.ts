import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedRequest } from '../../../types/extendedExpress.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.query;
    if (!planId) {
      throw new ErrorWithStatus('Invalid query - planId is required', 400);
    }
    if (typeof planId != 'string') {
      throw new ErrorWithStatus('Invalid query - planId must be string', 400);
    }
    if(!/^\d+$/.test(planId)) {
      throw new ErrorWithStatus('Invalid query - invalid planId format', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
