import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { ListUpdateData } from '../../../types/list.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<ListUpdateData>, res: Response, next: NextFunction) => {
  try {
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length > 1) throw new ErrorWithStatus('Invalid payload - too many arguments', 400);
    const title = req.body.title;
    if (!title) {
      throw new ErrorWithStatus('Invalid payload - title required', 400);
    }
    if (typeof title != 'string') {
      throw new ErrorWithStatus('Invalid payload - title must be string', 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
