import { createMealPlan, createSecondaryUser, setupDb, signUpAndCreateMealPlan } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('GET /plan-shares/plans', () => {
  beforeEach(setupDb);

  it('gets meal plans shared with user at GET /plan-shares/plans', async () => {
    const { agent, token, userId, planId } = await signUpAndCreateMealPlan('2023-06-17');
    const planId2 = await createMealPlan(agent, token, '2023-06-18');
    const { token2, secondUserId } = await createSecondaryUser(agent);
    
    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId, editable: false });

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId: planId2, userId: secondUserId, editable: true });

    const res = await agent.get('/plan-shares/plans')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared meal plans found successfully',
      mealPlans: expect.arrayContaining([
        expect.objectContaining({
          id: planId,
          ownerId: userId,
        })
      ])
    });
    expect(res.body.mealPlans.length).toBe(2);
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).get('/plan-shares/plans');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});
