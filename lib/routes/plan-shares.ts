import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { AuthenticatedReqBody, AuthenticatedReqParams, AuthenticatedReqQuery, AuthenticatedRequest, TypedAuthenticatedRequest, TypedResponse } from '../types/extendedExpress.js';
import { MultiplePublicUsersRes, NewPlanShareData, PlanShareRes, PlanShareUpdateData } from '../types/planShare.js';
import { NextFunction } from 'express-serve-static-core';
import { PlanShare } from '../models/PlanShare.js';
import validateSharePlan from '../middleware/validation/plan-shares/create.js';
import authorizeSharePlan from '../middleware/authorization/plan-shares/create.js';
import authorizeUpdatePlanShare from '../middleware/authorization/plan-shares/update.js';
import validateUpdateShare from '../middleware/validation/shares/update.js';
import { MultipleMealPlanRes } from '../types/mealPlan.js';
import validateGetUsers from '../middleware/validation/plan-shares/get-users.js';
import authorizeGetUsers from '../middleware/authorization/plan-shares/get-users.js';
import authorizeDeletePlanShare from '../middleware/authorization/plan-shares/delete.js';

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
    })
  .put('/:id', [authenticate, authorizeUpdatePlanShare, validateUpdateShare],
    async (req: TypedAuthenticatedRequest<PlanShareUpdateData, { id: string }>, 
      res: TypedResponse<PlanShareRes>, next: NextFunction) => {
      try {
        const planShare = await PlanShare.updateById(req.params.id, req.body);
        res.json({
          message: 'Plan share updated successfully',
          planShare
        });
      } catch (e) {
        next(e);
      }
    })
  .get('/plans', authenticate, async (req: AuthenticatedRequest, 
    res: TypedResponse<MultipleMealPlanRes>, next: NextFunction) => {
    try {
      const mealPlans = await PlanShare.getPlansByUserId(req.user.id);
      res.json({
        message: 'Shared meal plans found successfully',
        mealPlans
      });
    } catch (e) {
      next(e);
    }
  })
  .get('/users', [authenticate, validateGetUsers, authorizeGetUsers], async (req: AuthenticatedReqQuery<{ planId: string }>,
    res: TypedResponse<MultiplePublicUsersRes>, next: NextFunction) => {
    try {
      const users = await PlanShare.getUsersByPlanId(req.query.planId);
      res.json({
        message: 'Users found successfully',
        users
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, authorizeDeletePlanShare], async (req: AuthenticatedReqParams<{ id: string }>,
    res: TypedResponse<PlanShareRes>, next: NextFunction) => {
    try {
      const planShare = await PlanShare.deleteById(req.params.id);
      res.json({
        message: 'Plan share deleted successfully',
        planShare
      });
    } catch (e) {
      next(e);
    }
  });
