import { createSecondaryUser, setupDb, signUp, signUpAndCreateMealPlan, testUser3 } from '../utils.js';

describe('POST /plan-shares', () => {
  beforeEach(setupDb);

  it('shares a meal plan at POST /plan-shares', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        userId: secondUserId,
        editable: false
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Meal plan shared successfully',
      planShare: {
        id: expect.any(String),
        planId,
        userId: secondUserId,
        editable: false
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .send({
        planId,
        userId: secondUserId,
        editable: false
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
  
  it('gives a 404 error for nonexistent meal plan', async () => {
    const { agent, token } = await signUp();
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId: '101',
        userId: secondUserId,
        editable: false
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Meal plan not found');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const { secondUserId } = await createSecondaryUser(agent);

    const thirdUserRes = await agent.post('/users')
      .send(testUser3);
    const thirdUserToken = thirdUserRes.body.token;

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${thirdUserToken}`)
      .send({
        planId,
        userId: secondUserId,
        editable: false
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to share this meal plan');
  });

  it('gives a 400 error for missing planId', async () => {
    const { agent, token } = await signUp();
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: secondUserId,
        editable: false
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - planId is required');
  });

  it('gives a 400 error for missing userId', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        editable: false
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - userId is required');
  });

  it('gives a 400 error for missing editable argument', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable is required');
  });

  it('gives a 400 error for invalid planId type', async () => {
    const { agent, token } = await signUp();
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: secondUserId,
        editable: false,
        planId: 5
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - planId must be string');
  });

  it('gives a 400 error for invalid userId type', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        editable: false,
        userId: {}
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - userId must be string');
  });

  it('gives a 400 error for invalid editable type', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');
    const { secondUserId } = await createSecondaryUser(agent);

    const res = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        userId: secondUserId,
        editable: 'false'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable must be boolean');
  });
});
