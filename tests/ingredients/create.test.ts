import { createSecondaryUser, setupDb, signUpAndCreateRecipe, testIngredient } from '../utils.js';

describe('POST /ingredients tests', () => {
  beforeEach(setupDb);

  it('adds a new ingredient at POST /ingredients', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient added successfully',
      ingredient: {
        ...testIngredient,
        id: expect.any(String),
        recipeId
      }
    });
  });

  it('adds a new ingredient for user with edit access', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const { token2, secondUserId } = await createSecondaryUser(agent);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUserId, recipeId, editable: true });

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testIngredient });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Ingredient added successfully',
      ingredient: {
        ...testIngredient,
        id: expect.any(String),
        recipeId
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .send({ ...testIngredient });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ ...testIngredient });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this recipe');
  });

  it('gives a 400 error for missing recipeId', async () => {
    const { agent, token } = await signUpAndCreateRecipe();

    const res = await agent.post('/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - recipeId required');
  });

  it('gives a 400 error with too many arguments', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient, other: 'bad data' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - too many arguments');
  });

  it('gives a 400 error for missing name', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient, name: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name required');
  });

  it('gives a 400 error for invalid type of name', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient, name: {} });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name must be string');
  });

  it('gives a 400 error for invalid type of amount', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...testIngredient, amount: {} });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - amount must be string or null');
  });
});
