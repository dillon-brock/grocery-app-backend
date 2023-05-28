import { createRecipe, setupDb, signUp, testUser2 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('PUT /recipes/:id tests', () => {
  beforeEach(setupDb);

  it('updates a recipe at PUT /recipes/:id', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe updated successfully',
      recipe: {
        name: 'Updated name',
        description: null,
        id: expect.any(String),
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('updates a recipe for user with edit access', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: true });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 }: { token: string } = await signInRes.body; 

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe updated successfully',
      recipe: {
        name: 'Updated name',
        id: expect.any(String),
        description: null,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        ownerId: userId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const signUpRes = await agent.post('/users').send(testUser2);
    const { token: token2 }: { token: string } = signUpRes.body;

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.put(`/recipes/${recipeId}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for invalid name type', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: {} });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name must be string');
  });

  it('gives a 400 error for empty string name argument', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name cannot be empty string');
  });
});
