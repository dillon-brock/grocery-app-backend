import { UserService } from '../../lib/services/UserService.js';
import { createSecondaryUser, setupDb, signUpAndCreateMealPlan, testUser3 } from '../utils.js';

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
});
