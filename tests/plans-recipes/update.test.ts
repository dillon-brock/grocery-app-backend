import { createRecipe, setupDb, signUpAndCreateMealPlan } from '../utils.js';

describe('PUT /plans-recipes/:id', () => {
  beforeEach(setupDb);

  it('updates meal at PUT /plans-recipes/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);

    const addRecipeRes = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        recipeId,
        meal: 'Dinner'
      });
    const planRecipeId = addRecipeRes.body.planRecipe.id;

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ meal: 'Breakfast' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe updated successfully',
      planRecipe: {
        id: planRecipeId,
        planId,
        recipeId,
        meal: 'Breakfast'
      }
    });
  });

  it('updates recipeId at PUT /plans-recipes/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const secondRecipeRes = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'fried chicken' });
    const recipeId2 = secondRecipeRes.body.recipe.id;

    const addRecipeRes = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        recipeId,
        meal: 'Dinner'
      });
    const planRecipeId = addRecipeRes.body.planRecipe.id;

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: recipeId2 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe updated successfully',
      planRecipe: {
        id: planRecipeId,
        planId,
        recipeId: recipeId2,
        meal: 'Dinner'
      }
    });
  });
});
