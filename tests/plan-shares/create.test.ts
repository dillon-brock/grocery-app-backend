import { createSecondaryUser, setupDb, signUp } from '../utils.js';

describe('POST /plan-shares', () => {
  beforeEach(setupDb);

  it('shares a meal plan at POST /plan-shares', async () => {
    const { agent, token } = await signUp();
    const { secondUserId } = await createSecondaryUser(agent);

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-08-11' });

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId: mealPlanRes.body.mealPlan.id,
        userId: secondUserId,
        editable: false
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan shared successfully',
      planShare: {
        id: expect.any(String),
        planId: mealPlanRes.body.mealPlan.id,
        userId: secondUserId,
        editable: false
      }
    });
  });
});
