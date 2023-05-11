import { createRecipeStep, setupDb, signUpAndCreateRecipe, signUpAndShareRecipe, testStep } from './utils.js';

describe('POST /recipe-steps', () => {
  beforeEach(setupDb);

  it('adds a new step at POST /recipe-steps', async () =>  {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(testStep);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step added successfully',
      step: {
        ...testStep,
        id: expect.any(String),
        recipeId
      }
    });
  });

  it('adds a new step for user with edit access', async () => {
    const { agent, token2, recipeId } = await signUpAndShareRecipe(true);

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send(testStep);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Step added successfully',
      step: {
        ...testStep,
        id: expect.any(String),
        recipeId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token2, recipeId } = await signUpAndShareRecipe(false);

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send(testStep);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .send(testStep);
    
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for missing query', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.post('/recipe-steps')
      .set('Authorization', `Bearer ${token}`)
      .send(testStep);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Missing recipeId query parameter');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.post('/recipe-steps?recipeId=786981')
      .set('Authorization', `Bearer ${token}`)
      .send(testStep);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });
});



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
});


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
