import { setupDb, signUpAndGetInfo } from '../utils.js';
// import request from 'supertest';
// import app from '../../lib/app.js';

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
});
