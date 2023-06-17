import { createPlanRecipe, createRecipe, setupDb, signUpAndCreateMealPlan } from '../utils.js';

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
});
