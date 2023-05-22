import { addIngredient, createSecondaryUser, setupDb, signUpAndCreateRecipe } from '../utils.js';

describe('PUT /ingredients/:id', () => {
  beforeEach(setupDb);

  it('updates an ingredient at PUT /ingredients/:id', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'oat milk' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient updated successfully',
      ingredient: {
        id: ingredientId,
        name: 'oat milk',
        amount: '1 cup',
        recipeId
      }
    });
  });

  it('updates an ingredient for user with edit access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: true });

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ amount: '2 cups' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient updated successfully',
      ingredient: {
        id: ingredientId,
        name: 'milk',
        amount: '2 cups',
        recipeId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: false });

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ amount: '2 cups' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.put(`/ingredients/${ingredientId}`)
      .send({ amount: '2 cups' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent ingredient', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.put('/ingredients/568902')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'oat milk' });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Ingredient not found');
  });
});
