import { createRecipe, setupDb, signUpAndCreateMealPlan } from '../utils.js';

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
});
