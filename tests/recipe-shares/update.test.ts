import { setupDb, signUpAndShareRecipe } from '../utils.js';

describe('PUT /recipe-shares/:id tests', () => {
  beforeEach(setupDb);

  it('updates a users permissions at PUT /recipe-shares/:id', async () => {
    const { agent, token, shareId, recipeId, sharedUserId } = await signUpAndShareRecipe(false);

    const res = await agent.put(`/recipe-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe share updated successfully',
      recipeShare: {
        id: shareId,
        recipeId,
        userId: sharedUserId,
        editable: true
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token2, shareId } = await signUpAndShareRecipe(false);

    const res = await agent.put(`/recipe-shares/${shareId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ editable: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual(
      'You are not authorized to make changes to this information'
    );
  });

  it('gives a 400 error missing editable argument', async () => {
    const { agent, token, shareId } = await signUpAndShareRecipe(false);

    const res = await agent.put(`/recipe-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable is required');
  });

  it('gives a 400 for invalid editable type', async () => {
    const { agent, token, shareId } = await signUpAndShareRecipe(false);

    const res = await agent.put(`/recipe-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: 'true' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - editable must be boolean');
  });
});
