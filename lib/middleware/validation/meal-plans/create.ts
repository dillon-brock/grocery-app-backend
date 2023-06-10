import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<{ date: string }>, res: Response, next: NextFunction) => {
  try {
    const { date } = req.body;
    if (date == undefined) {
      throw new ErrorWithStatus('Invalid payload - date is required', 400);
    }
    if (typeof date != 'string') {
      throw new ErrorWithStatus('Invalid payload - date must be string', 400);
    }
    next();
  }
  catch (e) {
    next(e);
  }
};
