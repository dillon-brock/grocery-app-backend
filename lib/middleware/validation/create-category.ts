import { NextFunction, Response } from 'express-serve-static-core';
import { NewCategoryData } from '../../types/category.js';
import { AuthenticatedReqBody } from '../../types/extendedExpress.js';
import { ErrorWithStatus } from '../../types/error.js';

export default async (req: AuthenticatedReqBody<NewCategoryData>, res: Response, next: NextFunction) => {
  try {
    const expectedArgs: Array<keyof NewCategoryData> = ['name', 'listId'];
    const args = Object.keys(req.body);

    if (expectedArgs.length < args.length) {
      throw new ErrorWithStatus('Invalid payload - too many arguments', 400);
    }

    for (const key of expectedArgs) {
      if (!req.body[key]) {
        throw new ErrorWithStatus(`Invalid payload - ${key} required`, 400);
      }
      if (typeof req.body[key] != 'string') {
        throw new ErrorWithStatus(`Invalid payload - ${key} must be string`, 400);
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
