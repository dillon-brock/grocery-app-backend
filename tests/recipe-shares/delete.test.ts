/* @jest-environment node */
import { setupDb, signUpAndShareRecipe } from '../utils.js';

describe('DELETE /recipe-shares/:id tests', () => {
  beforeEach(setupDb);

  it('deletes recipe share (stops sharing recipe) at DELETE /recipe-shares/:id', async () => {
    const { agent, token, shareId, recipeId, sharedUserId } = await signUpAndShareRecipe(false);

    const res = await agent.delete(`/recipe-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe share deleted successfully',
      recipeShare: {
        id: shareId,
        recipeId,
        userId: sharedUserId,
        editable: false
      }
    });
  });
  
  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, shareId } = await signUpAndShareRecipe(false);

    const res = await agent.delete(`/recipe-shares/${shareId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token2, shareId } = await signUpAndShareRecipe(false);

    const res = await agent.delete(`/recipe-shares/${shareId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual(
      'You are not authorized to make changes to this information'
    );
  });
});
