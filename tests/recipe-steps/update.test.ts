import { createRecipeStep, setupDb, signUpAndCreateRecipe, signUpAndShareRecipe, testStep } from '../utils.js';

describe('PUT /recipe-steps/:id', () => {
  beforeEach(setupDb);

  it('updates a recipe step at PUT /recipe-steps/:id', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.put(`/recipe-steps/${stepId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ detail: 'new instructions' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step updated successfully',
      step: {
        ...testStep,
        detail: 'new instructions',
        id: stepId,
        recipeId
      }
    });
  });

  it('updates a recipe step for user with edit access', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(true);
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.put(`/recipe-steps/${stepId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ detail: 'new instructions' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step updated successfully',
      step: {
        ...testStep,
        detail: 'new instructions',
        id: stepId,
        recipeId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(false);
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.put(`/recipe-steps/${stepId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ detail: 'new instructions' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 404 error for nonexistent step', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.put('/recipe-steps/6758')
      .set('Authorization', `Bearer ${token}`)
      .send({ detail: 'new instructions' });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Step not found');
  });
});
