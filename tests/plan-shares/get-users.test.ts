import { UserService } from '../../lib/services/UserService.js';
import { createSecondaryUser, setupDb, signUp, signUpAndCreateMealPlan, testUser3 } from '../utils.js';

describe('GET /plan-shares/users', () => {
  beforeEach(setupDb);

  it('gets a list of users with access to meal plan at GET /plan-shares/users', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-17');
    const { secondUserId } = await createSecondaryUser(agent);
    
    const thirdUser = await UserService.create({ ...testUser3 });
    const thirdUserId = thirdUser.id;

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId, editable: false });

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: thirdUserId, editable: true });

    const res = await agent.get(`/plan-shares/users?planId=${planId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Users found successfully',
      users: expect.arrayContaining([{
        id: thirdUserId,
        username: testUser3.username
      }])
    });
    expect(res.body.users.length).toBe(2);
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, planId } = await signUpAndCreateMealPlan('2023-06-18');

    const res = await agent.get(`/plan-shares/users?planId=${planId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 400 error for missing planId query', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/plan-shares/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - planId is required');
  });

  it('gives a 400 error for invalid planId format', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/plan-shares/users?planId=badId')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid query - invalid planId format');
  });
});
