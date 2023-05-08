import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

const testRecipe = {
  name: 'mac and cheese',
  description: 'so cheesy and delicious'
};

describe('POST /recipes tests', () => {
  beforeEach(setupDb);

  it('creates a new recipe at POST /recipes', async () => {
    const agent = request.agent(app);
    
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;

    const userRes = await agent.get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    const userId = userRes.body.user.id;

    const res = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(testRecipe);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe created successfully',
      recipe: {
        ...testRecipe,
        id: expect.any(String),
        userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });
});
