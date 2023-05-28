import { addIngredient, createSecondaryUser, setupDb, signUpAndCreateRecipe, testIngredient } from '../utils.js';
import { Ingredient } from '../../lib/models/Ingredient.js';

describe('DELETE /ingredients/:id', () => {
  beforeEach(setupDb);

  it('deletes an ingredient at DELETE /ingredients/:id', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.delete(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient deleted successfully',
      ingredient: {
        ...testIngredient,
        id: ingredientId,
        recipeId
      }
    });

    const ingredient = await Ingredient.findById(ingredientId);
    expect(ingredient).toBe(null);
  });

  it('deletes an ingredient for user with edit access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: true });

    const res = await agent.delete(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient deleted successfully',
      ingredient: {
        ...testIngredient,
        id: ingredientId,
        recipeId
      }
    });

    const ingredient = await Ingredient.findById(ingredientId);
    expect(ingredient).toBe(null);
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);
    const ingredientId = await addIngredient(agent, token, recipeId);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: false });

    const res = await agent.delete(`/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const ingredientId = await addIngredient(agent, token, recipeId);

    const res = await agent.delete(`/ingredients/${ingredientId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
