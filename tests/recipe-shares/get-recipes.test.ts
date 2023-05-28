import { setupDb, signUpAndShareRecipe, testRecipe } from '../utils.js';

describe('GET /recipe-shares/recipes tests', () => {
  beforeEach(setupDb);

  test('gets recipes shared with user at GET /recipes-shares/recipes', async () => {
    const { agent, token2, recipeId } = await signUpAndShareRecipe(false);

    const res = await agent.get('/recipe-shares/recipes')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared recipes found',
      recipes: expect.any(Array)
    });
    expect(res.body.recipes[0]).toEqual({
      ...testRecipe,
      description: null,
      id: recipeId,
      ownerId: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent } = await signUpAndShareRecipe(false);

    const res = await agent.get('/recipe-shares/recipes');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
