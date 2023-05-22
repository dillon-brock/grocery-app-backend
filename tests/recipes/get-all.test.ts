import { setupDb, signUp, testRecipe } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('GET /recipes test', () => {
  beforeEach(setupDb);

  it('gets all of a users recipes at GET /recipes', async () => {
    const { agent, token, userId } = await signUp();

    await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(testRecipe);

    const res = await agent.get('/recipes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipes found',
      recipes: expect.any(Array)
    });
    expect(res.body.recipes[0]).toEqual({
      ...testRecipe,
      description: null,
      id: expect.any(String),
      ownerId: userId,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app)
      .get('/recipes');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
