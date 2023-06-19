import { createSecondaryUser, setupDb, shareMealPlan, signUp, signUpAndCreateMealPlan } from '../utils.js';

describe('DELETE /plan-shares/:id', () => {
  beforeEach(setupDb);

  it('deletes a plan share at DELETE /plan-shares/:id', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-18');
    const { secondUserId } = await createSecondaryUser(agent);
    const planShareId = await shareMealPlan(agent, token, {
      planId, userId: secondUserId, editable: false
    });

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

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-18');
    const { secondUserId } = await createSecondaryUser(agent);
    const planShareId = await shareMealPlan(agent, token, {
      planId, userId: secondUserId, editable: false
    });

    const res = await agent.delete(`/plan-shares/${planShareId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent plan share', async () => {
    const { agent, token } = await signUp();

    const res = await agent.delete('/plan-shares/101')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Plan share not found');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-18');
    const { secondUserId, token2 } = await createSecondaryUser(agent);
    const planShareId = await shareMealPlan(agent, token, {
      planId, userId: secondUserId, editable: false
    });

    const res = await agent.delete(`/plan-shares/${planShareId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to modify the share settings of this meal plan');
  });
});
