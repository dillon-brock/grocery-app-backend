import { createMealPlan, createSecondaryUser, setupDb, signUp, signUpAndCreateMealPlan } from '../utils.js';

describe('PUT /meal-plans/:id', () => {
  beforeEach(setupDb);

  it('updates a meal plan at PUT /meal-plans/:id', async () => {

    const { agent, token, planId, userId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-14' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan updated successfully',
      mealPlan: {
        id: planId,
        ownerId: userId,
        date: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.put(`/meal-plans/${planId}`)
      .send({ date: '2023-06-14' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();
    const { token2 } = await createSecondaryUser(agent);
    const planId = await createMealPlan(agent, token, '2023-06-13');

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ date: '2023-06-14' });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to update this meal plan');
  });

  it('gives a 400 error for missing date', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - date is required');
  });

  it('gives a 400 error for invalid date type', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.put(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: 2023 });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - date must be string');
  });
});
