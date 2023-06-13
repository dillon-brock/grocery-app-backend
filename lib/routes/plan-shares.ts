import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, TypedResponse } from '../types/extendedExpress.js';
import { NewPlanShareData, PlanShareRes } from '../types/planShare.js';
import { NextFunction } from 'express-serve-static-core';
import { PlanShare } from '../models/PlanShare.js';
import validateSharePlan from '../middleware/validation/plan-shares/create.js';
import authorizeSharePlan from '../middleware/authorization/plan-shares/create.js';

export default Router()
  .post('/', [authenticate, validateSharePlan, authorizeSharePlan], 
    async (req: AuthenticatedReqBody<NewPlanShareData>, 
      res: TypedResponse<PlanShareRes>, next: NextFunction) => {
      try {
        const planShare = await PlanShare.create(req.body);
        res.json({
          message: 'Meal plan shared successfully',
          planShare
        });
      } catch (e) {
        next(e);
      }
    });