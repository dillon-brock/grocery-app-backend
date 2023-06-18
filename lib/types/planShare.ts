import { PlanShare } from '../models/PlanShare.js';
import { PublicUser } from '../models/User.js';
import { SuccessResponse } from './global.js';

export type PlanShareFromDB = {
  id: string;
  user_id: string;
  plan_id: string;
  editable: boolean;
};

export type NewPlanShareData = {
  planId: string;
  userId: string;
  editable: boolean;
};

export interface PlanShareRes extends SuccessResponse {
  planShare: PlanShare
}

export type PlanShareUpdateData = {
  editable?: boolean;
}

export interface MultiplePublicUsersRes extends SuccessResponse {
  users: PublicUser[]
}
