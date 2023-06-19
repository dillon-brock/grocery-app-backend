import { createRecipe, createSecondaryUser, setupDb, signUp, signUpAndCreateMealPlan } from '../utils.js';

describe('DELETE /meal-plans/:id', () => {
  beforeEach(setupDb);

  it('deletes a meal plan at DELETE /meal-plans/:id', async () => {
    const { agent, token, userId, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const recipeId = await createRecipe(agent, token);

    await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        recipeId,
        meal: 'Dinner'
      });

    const res = await agent.delete(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan deleted successfully', 
      mealPlan: {
        id: planId,
        date: expect.any(String),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        ownerId: userId
      }
    });
  });

  it('gives a 404 error for nonexistent meal plan', async () => {
    const { agent, token } = await signUp();

    const res = await agent.delete('/meal-plans/583')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Meal plan not found');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.delete(`/meal-plans/${planId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to delete this meal plan');
  });
});
