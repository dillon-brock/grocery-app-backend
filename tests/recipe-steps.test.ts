import { setupDb, signUpAndCreateRecipe, signUpAndShareRecipe, testStep } from './utils.js';

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
});
