import { NextFunction, Response } from 'express-serve-static-core';
import { TypedAuthenticatedRequest } from '../../../types/extendedExpress.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: TypedAuthenticatedRequest<{ name: string}, { id: string }>,
  res: Response, next: NextFunction) => {
  try {
    const args = Object.keys(req.body);
    if (args.length > 1) {
      throw new ErrorWithStatus('Invalid payload - too many arguments', 400);
    }
    if (!req.body.name) {
      throw new ErrorWithStatus('Invalid payload - name required', 400);
    }
    if (typeof req.body.name != 'string') {
      throw new ErrorWithStatus('Invalid payload - name must be string', 400);
    }

    next();
  } catch (e) {
    next(e);
  }
};
