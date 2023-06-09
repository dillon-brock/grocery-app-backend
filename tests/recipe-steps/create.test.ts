import { setupDb, signUpAndCreateRecipe, signUpAndShareRecipe, testStep } from '../utils.js';

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
    expect(res.body.message).toEqual('Invalid query - recipeId is required');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.post('/recipe-steps?recipeId=786981')
      .set('Authorization', `Bearer ${token}`)
      .send(testStep);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 400 error for missing num argument', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ detail: testStep.detail });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - num is required');
  });

  it('gives a 400 error for invalid num type', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ num: testStep.num.toString(), detail: testStep.detail });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - num must be number');
  });

  it('gives a 400 error for missing detail argument', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ num: testStep.num });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - detail is required');
  });

  it('gives a 400 error for invalid detail type', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ num: testStep.num, detail: {} });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - detail must be string');
  });
});
