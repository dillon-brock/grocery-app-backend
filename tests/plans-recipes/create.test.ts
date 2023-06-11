import { createRecipe, setupDb, signUp } from '../utils.js';
// import request from 'supertest';
// import app from '../../lib/app.js';

describe('POST /plans-recipes', () => {
  beforeEach(setupDb);

  it('adds a recipe to a meal plan at POST /plans-recipes', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

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
});
