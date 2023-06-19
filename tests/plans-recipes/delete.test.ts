import { createPlanRecipe, createRecipe, createSecondaryUser, setupDb, signUp, signUpAndCreateMealPlan } from '../utils.js';

describe('DELETE /plans_recipes', () => {
  beforeEach(setupDb);

  it('deletes a recipe from meal plan at DELETE /plans-recipes/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.delete(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe deleted successfully',
      planRecipe: {
        id: planRecipeId,
        recipeId,
        planId,
        meal: 'Dinner'
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);

    const res = await agent.delete(`/plans-recipes/${planRecipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent plan recipe', async () => {
    const { agent, token } = await signUp();

    const res = await agent.delete('/plans-recipes/101')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Plan recipe not found');
  });

  it('gives a 403 error for user not authorized to access meal plan', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.delete(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token2}`);

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

    const res = await agent.delete(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this meal plan');
  });

  it('deletes a plan recipe for authorized user', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-14');
    const recipeId = await createRecipe(agent, token);
    const planRecipeId = await createPlanRecipe(agent, token, planId, recipeId);
    const { token2, secondUserId } = await createSecondaryUser(agent);

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId, editable: true });

    const res = await agent.delete(`/plans-recipes/${planRecipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe deleted successfully',
      planRecipe: {
        id: planRecipeId,
        recipeId,
        planId,
        meal: 'Dinner'
      }
    });
  });
});
