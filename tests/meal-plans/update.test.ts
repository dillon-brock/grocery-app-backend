import { setupDb, signUpAndGetInfo } from '../utils.js';

describe('PUT /meal-plans/:id', () => {
  beforeEach(setupDb);

  it('updates a meal plan at PUT /meal-plans/:id', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-13' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-14' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan updated successfully',
      mealPlan: {
        id: planId,
        ownerId: user.id,
        date: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });
});
