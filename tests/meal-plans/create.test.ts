import { setupDb, signUp, signUpAndGetInfo } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('POST /meal-plans', () => {
  beforeEach(setupDb);

  it('creates a new meal plan at POST /meal-plans', async () => {
    const { agent, token, user } = await signUpAndGetInfo();
    const date = '2023-07-11';

    const res = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan created successfully',
      mealPlan: {
        id: expect.any(String),
        ownerId: user.id,
        date: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).post('/meal-plans')
      .send({ date: '2023-12-3' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for missing date', async () => {
    const { agent, token } = await signUp();

    const res = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - date is required');
  });

  it('gives a 400 error for invalid date type', async () => {
    const { agent, token } = await signUp();

    const res = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - date must be string');
  });
});
