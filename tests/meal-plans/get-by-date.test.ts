import { createMealPlan, createRecipe, createSecondaryUser, setupDb, signUpAndCreateMealPlan, testRecipe } from '../utils.js';

describe('GET /meal-plans/:date', () => {
  beforeEach(setupDb);

  it('GETS a meal plan with recipes by date at GET /meal-plans/:date', async () => {
    const date = '2023-06-13';
    const { agent, token, userId, planId } = await signUpAndCreateMealPlan(date);
    const recipeId = await createRecipe(agent, token);

    await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        recipeId,
        meal: 'Dinner'
      });

    const res = await agent.get(`/meal-plans/${date}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan found successfully',
      mealPlan: {
        id: planId,
        ownerId: userId,
        date: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        recipes: [{
          id: recipeId,
          name: testRecipe.name,
          meal: 'Dinner'
        }]
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const date = '2023-06-13';
    const { agent } = await signUpAndCreateMealPlan(date);

    const res = await agent.get(`/meal-plans/${date}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('only returns meal plans belonging to current user', async () => {
    const date = '2023-06-13';
    const { agent, token, planId } = await signUpAndCreateMealPlan(date);
    const { token2 } = await createSecondaryUser(agent);
    await createMealPlan(agent, token2, date);

    const res = await agent.get(`/meal-plans/${date}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan found successfully',
      mealPlan: expect.objectContaining({
        id: planId
      })
    });
  });
});
