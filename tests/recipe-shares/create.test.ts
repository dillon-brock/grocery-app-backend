import { setupDb, signUpAndCreateRecipe, testUser2, testUser3 } from '../utils.js';
import { UserService } from '../../lib/services/UserService.js';

describe('POST /recipe-shares tests', () => {
  beforeEach(setupDb);

  it('shares a recipe at POST /recipe-shares', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe shared successfully',
      recipeShare: {
        id: expect.any(String),
        recipeId,
        editable: false,
        userId: secondUser.id
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    const signUpRes = await agent.post('/users').send(testUser3);
    const { token } = signUpRes.body;

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, recipeId, editable: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to share this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .send({ userId: secondUser.id, recipeId, editable: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, recipeId: '794921', editable: false });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 404 error for nonexistent user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: '358', recipeId, editable: true });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('User not found');
  });
});
