import { createRecipe, createSecondaryUser, setupDb, signUp, signUpAndCreateRecipe } from '../utils.js';
// import request from 'supertest';
// import app from '../../lib/app.js';

describe('POST /plans-recipes', () => {
  beforeEach(setupDb);

  it('adds a recipe to a meal plan at POST /plans-recipes', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-07-11' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        planId: mealPlanRes.body.mealPlan.id,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe created successfully',
      planRecipe: {
        id: expect.any(String),
        recipeId,
        planId: mealPlanRes.body.mealPlan.id,
        meal: 'Dinner'
      }
    });
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUp();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-07-11' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        planId: mealPlanRes.body.mealPlan.id,
        recipeId: '101',
        meal: 'Breakfast'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 404 error for nonexistent meal plan', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        recipeId, 
        planId: '202',
        meal: 'Lunch'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Meal plan not found');
  });

  it('gives a 403 error for user not authorized to access recipe', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token2}`)
      .send({ date: '2023-08-12' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({ 
        planId: mealPlanRes.body.mealPlan.id,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });
});
