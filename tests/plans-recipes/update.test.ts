import { createPlanRecipe, createRecipe, createSecondaryUser, setupDb, signUpAndCreateMealPlan } from '../utils.js';


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

  it('gives a 403 error for user not authorized to view meal plan', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ meal: 'Breakfast' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to access this meal plan');
  });

  it('gives a 403 error for user not authorized to edit meal plan', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const { token2, secondUserId } = await createSecondaryUser(agent);

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId, editable: false });

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ meal: 'Breakfast' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this meal plan');
  });

  it('gives a 404 error for invalid recipe_id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.put(`/plan-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: '101784' });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 403 error for user without recipe access', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const secondRecipeRes = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'fried chicken' });
    const secondRecipeId = secondRecipeRes.body.recipe.id;


    const res = await agent.put(`/plan-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: secondRecipeId });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('updates recipeId for user with access to recipe', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const { token2, secondUserId } = await createSecondaryUser(agent);

    const secondRecipeRes = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'fried chicken' });
    const recipeId2 = secondRecipeRes.body.recipe.id;

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipe_id: recipeId, userId: secondUserId, editable: false });

    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.put(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token2}`)
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
