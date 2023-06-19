import { createMealPlan, setupDb, signUp } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';

describe('GET /meal-plans', () => {
  beforeEach(setupDb);

  it('gets meal plans in specified date range at GET /meal-plans', async () => {
    const dates = ['2023-06-11', '2023-06-13', '2023-06-14', '2023-06-16', '2023-06-21'];
    const { agent, token, userId } = await signUp();
    for (const date of dates) {
      await createMealPlan(agent, token, date);
    }

    const res = await agent.get('/meal-plans?startDate=2023-06-10&endDate=2023-06-17')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plans found successfully',
      mealPlans: expect.any(Array)
    });
    expect(res.body.mealPlans.length).toBe(4);
    expect(res.body.mealPlans[0]).toEqual({
      id: expect.any(String),
      ownerId: userId,
      date: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      recipes: []
    });

  });

  it('gives a 401 error for unauthenticated users', async () => {
    const res = await request(app).get('/meal-plans?startDate=2023-06-10&endDate=2023-06-17');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for missing startDate', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/meal-plans?endDate=2023-06-17')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - startDate is required');
  });

  it('gives a 400 error for missing endDate', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/meal-plans?startDate=2023-06-10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - endDate is required');
  });

  it('gives a 400 error for improper startDate format', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/meal-plans?startDate=06-10-2023&endDate=2023-06-17')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - startDate must be in format YYYY-MM-DD');
  });

  it('gives a 400 error for improper endDate format', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/meal-plans?startDate=2023-06-10&endDate=06-17-2023')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - endDate must be in format YYYY-MM-DD');
  });
});
