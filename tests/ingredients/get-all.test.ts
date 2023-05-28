import { addIngredient, createSecondaryUser, setupDb, signUpAndCreateRecipe, testIngredient } from '../utils.js';

describe('GET /ingredients', () => {
  beforeEach(setupDb);

  it('gets a list of all ingredients corresponding to recipe at GET /ingredients', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredients found',
      ingredients: expect.arrayContaining([{
        ...testIngredient,
        id: ingredientId,
        recipeId
      }])
    });
  });

  it('gets a list of ingredients for user with view access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: false });

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredients found',
      ingredients: expect.arrayContaining([{
        ...testIngredient,
        id: ingredientId,
        recipeId
      }])
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.get(`/ingredients?recipeId=${recipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.get('/ingredients?recipeId=3895')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });
});
