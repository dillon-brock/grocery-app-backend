import { createRecipe, setupDb, signUp, testRecipe, testUser2 } from '../utils.js';

describe('DELETE /recipes/:id tests', () => {
  beforeEach(setupDb);

  it('deletes a recipe at DELETE /recipes/:id', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.delete(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe deleted successfully',
      recipe: {
        ...testRecipe,
        description: null,
        id: expect.any(String),
        ownerId: userId,
        updatedAt: expect.any(String),
        createdAt: expect.any(String)
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const signUpRes = await agent.post('/users').send(testUser2);
    const { token: token2 } = signUpRes.body;

    const res = await agent.delete(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 401 for unauthenticated user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.delete(`/recipes/${recipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});

