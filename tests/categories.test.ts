import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

describe('POST /categories tests', () => {
  beforeEach(setupDb);

  it('creates new category at POST /categories', async () => {
    const agent = request.agent(app);
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;

    const getUserRes = await agent.get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    const userId = getUserRes.body.user.id;

    const res = await agent.post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cheese' });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Category created successfully',
      category: {
        id: expect.any(String),
        name: 'Cheese',
        userId
      }
    });
  });
});
