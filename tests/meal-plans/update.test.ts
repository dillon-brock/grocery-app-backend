import { setupDb, signUp, signUpAndGetInfo, testUser2 } from '../utils.js';

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

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUp();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-13' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.put(`/meal-plans/${planId}`)
      .send({ date: '2023-06-14' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();

    const secondUserRes = await agent.post('/users')
      .send(testUser2);
    const { token: token2 } = secondUserRes.body;

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-13' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ date: '2023-06-14' });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to update this meal plan');
  });

  it('gives a 400 error for missing date', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-13' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - date is required');
  });

  it('gives a 400 error for invalid date type', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-13' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: 2023 });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - date must be string');
  });
});
