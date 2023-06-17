import { createSecondaryUser, setupDb, signUpAndCreateMealPlan } from '../utils.js';

describe('PUT /plan-shares/:id', () => {
  beforeEach(setupDb);

  it('updates plan share at PUT /plan-shares/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-17');
    const { secondUserId } = await createSecondaryUser(agent);
    
    const shareRes = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId, editable: true });
    const planShareId = shareRes.body.planShare.id;

    const res = await agent.put(`/plan-shares/${planShareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan share updated successfully',
      planShare: {
        id: planShareId,
        planId,
        userId: secondUserId,
        editable: false
      }
    });
  });
});
