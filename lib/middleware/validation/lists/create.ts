import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewListData } from '../../../types/list.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewListData>, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    if (title === undefined) {
      throw new ErrorWithStatus('Invalid payload - title is required', 400);
    }
    if (typeof title != 'string' && title != null) {
      throw new ErrorWithStatus('Invalid payload - title must be string or null', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
