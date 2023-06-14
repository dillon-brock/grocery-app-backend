import { NextFunction, Request, Response } from 'express-serve-static-core';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expectedQueries: string[] = ['startDate', 'endDate'];
    for (const q of expectedQueries) {
      if (!req.query[q]) {
        throw new ErrorWithStatus(`Invalid query - ${q} is required`, 400);
      }
      if (!(/^\d{4}-\d{2}-\d{2}$/.test(req.query[q] as string))) {
        throw new ErrorWithStatus(`Invalid query - ${q} must be in format YYYY-MM-DD`, 400);
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
