import { NextFunction, Response } from 'express-serve-static-core';
import { ErrorWithStatus } from '../../../types/error.js';
import { RequestWithQuery } from '../../../types/extendedExpress.js';

export default async (req: RequestWithQuery<{ username: string }>, res: Response, next: NextFunction) => {
  try {
    const { username } = req.query;

    if (username === undefined) {
      throw new ErrorWithStatus('Invalid query - username is required', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
