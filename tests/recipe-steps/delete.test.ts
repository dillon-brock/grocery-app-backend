import { createRecipeStep, setupDb, signUp, signUpAndCreateRecipe, signUpAndShareRecipe, testStep } from '../utils.js';

describe('DELETE /recipe-steps/:id', () => {
  beforeEach(setupDb);

  it('deletes a recipe step at DELETE /recipe-steps/:id', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.delete(`/recipe-steps/${stepId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step deleted successfully',
      step: {
        ...testStep,
        id: stepId,
        recipeId
      }
    });
  });

  it('deletes a recipe step for user with edit access', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(true);
    const stepId = await createRecipeStep(agent, token, recipeId);
    
    const res = await agent.delete(`/recipe-steps/${stepId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step deleted successfully',
      step: {
        ...testStep,
        id: stepId,
        recipeId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(false);
    const stepId = await createRecipeStep(agent, token, recipeId);
    
    const res = await agent.delete(`/recipe-steps/${stepId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 404 error for nonexistent step', async () => {
    const { agent, token } = await signUp();

    const res = await agent.delete('/recipe-steps/67777')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Step not found');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.delete(`/recipe-steps/${stepId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
