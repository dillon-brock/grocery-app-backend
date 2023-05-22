import { createRecipeStep, createSecondaryUser, setupDb, signUp, signUpAndCreateRecipe, signUpAndShareRecipe, testStep } from '../utils.js';

describe('GET /recipe-steps', () => {
  beforeEach(setupDb);

  it('gets a list of steps for recipe', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.get(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Steps found',
      steps: expect.arrayContaining([{
        ...testStep,
        id: stepId,
        recipeId
      }])
    });
  });

  it('gets a list of steps for user with view access', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(false);
    const stepId = await createRecipeStep(agent, token, recipeId);

    const res = await agent.get(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Steps found',
      steps: expect.arrayContaining([{
        ...testStep,
        id: stepId,
        recipeId
      }])
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.get(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.get(`/recipe-steps?recipeId=${recipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for missing recipeId query param', async () => {
    const { agent, token } = await signUp();
    const res = await agent.get('/recipe-steps')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Missing recipeId query parameter');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUp();
    const res = await agent.get('/recipe-steps?recipeId=78920')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });
});
