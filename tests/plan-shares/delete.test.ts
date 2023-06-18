import { createSecondaryUser, setupDb, signUpAndCreateMealPlan } from '../utils.js';

describe('DELETE /plan-shares/:id', () => {
  beforeEach(setupDb);

  it('deletes a plan share at DELETE /plan-shares/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-18');
    const { secondUserId } = await createSecondaryUser(agent);

    const sharePlanRes = await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, userId: secondUserId, editable: false });
    const planShareId = sharePlanRes.body.planShare.id;
    
    const res = await agent.delete(`/plan-shares/${planShareId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan share deleted successfully',
      planShare: expect.objectContaining({
        id: planShareId,
        planId,
        userId: secondUserId
      })
    });
  });
});
