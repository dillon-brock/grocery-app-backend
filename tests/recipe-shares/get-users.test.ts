import { setupDb, signUpAndShareRecipe, testUser2 } from '../utils.js';

describe('GET /recipe-shares/users tests', () => {
  beforeEach(setupDb);

  test('gets list of users with access to list at GET /recipe-shares/users', async () => {
    const { agent, token, recipeId } = await signUpAndShareRecipe(true);

    const res = await agent.get(`/recipe-shares/users?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared users found',
      users: expect.any(Array)
    });
    expect(res.body.users[0]).toEqual({ 
      email: testUser2.email,
      username: testUser2.username
    });
  });

  it('gives a 401 error for unauthenticated users', async () => {
    const { agent, recipeId } = await signUpAndShareRecipe(false);

    const res = await agent.get(`/recipe-shares/users?recipeId=${recipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized users', async () => {
    const { agent, token2, recipeId } = await signUpAndShareRecipe(false);

    const res = await agent.get(`/recipe-shares/users?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this information');
  });
});
