import { NextFunction, Response } from 'express-serve-static-core';
import { AuthenticatedReqBody } from '../../../types/extendedExpress.js';
import { NewPlanShareData } from '../../../types/planShare.js';
import { ErrorWithStatus } from '../../../types/error.js';

export default async (req: AuthenticatedReqBody<NewPlanShareData>, res: Response, next: NextFunction) => {
  try {
    const expectedArgs: Array<keyof NewPlanShareData> = ['planId', 'userId', 'editable'];

    for (const arg of expectedArgs) {
      if (req.body[arg] === undefined) {
        throw new ErrorWithStatus(`Invalid payload - ${arg} is required`, 400);
      }
      if (arg == 'planId' || arg == 'userId') {
        if (req.body[arg] == '') {
          throw new ErrorWithStatus(`Invalid payload - ${arg} is required`, 400);
        }
        if (typeof req.body[arg] != 'string') {
          throw new ErrorWithStatus(`Invalid payload - ${arg} must be string`, 400);
        }
      }
      else if (arg == 'editable') {
        if (typeof req.body[arg] != 'boolean') {
          throw new ErrorWithStatus(`Invalid payload - ${arg} must be boolean`, 400);
        }
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
