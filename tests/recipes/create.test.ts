import { setupDb, signUp, testRecipe } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';


describe('POST /recipes tests', () => {
  beforeEach(setupDb);

  it('creates a new recipe at POST /recipes', async () => {
    const { agent, token, userId } = await signUp();

    const res = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(testRecipe);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe created successfully',
      recipe: {
        ...testRecipe,
        description: null,
        id: expect.any(String),
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).post('/recipes')
      .send(testRecipe);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('You must be signed in to continue');
  });

  it('gives a 400 error for missing name', async () => {
    const { agent, token } = await signUp();

    const res = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name is required');
  });

  it('gives a 400 error for invalid name type', async () => {
    const { agent, token } = await signUp();

    const res = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - name must be string');
  });
});
