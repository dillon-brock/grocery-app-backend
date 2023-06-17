import { createPlanRecipe, createRecipe, setupDb, signUpAndCreateMealPlan } from '../utils.js';

describe('PUT /plans-recipes/:id', () => {
  beforeEach(setupDb);

  it('updates meal at PUT /plans-recipes/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

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

    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

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

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .send({ meal: 'Breakfast' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for misspelling recipe_id key', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId: '2' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - unexpected argument recipeId (did you mean recipe_id?)');
  });

  it('gives a 400 error for unexpected argument', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ badData: '' });

    expect(res.status).toBe(400);
    expect('Invalid payload - unexpected argument badData');
  });

  it('gives a 400 error for invalid argument type', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ meal: true });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - meal must be string');
  });
});
