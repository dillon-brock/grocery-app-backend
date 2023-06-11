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
