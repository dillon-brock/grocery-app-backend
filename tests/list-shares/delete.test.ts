/* @jest-environment node */
import { setupDb, signUpAndShareList, testUser3 } from '../utils.js';

describe('DELETE /list-shares test', () => {
  beforeEach(setupDb);

  it('deletes list share (stops sharing list) at DELETE /list-shares/:id', async () => {
    const { agent, token, shareId, sharedUserId } = await signUpAndShareList();

    const res = await agent
      .delete(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Stopped sharing list successfully',
      shareData: expect.objectContaining({
        id: shareId,
        userId: sharedUserId
      })
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, shareId } = await signUpAndShareList();

    const res = await agent.delete(`/list-shares/${shareId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, shareId } = await signUpAndShareList();

    const signUpRes = await agent.post('/users').send(testUser3);
    const { token } = signUpRes.body;

    const res = await agent
      .delete(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to alter the sharing settings of this list');
  });

  it('gives a 404 error for nonexistent list share data', async () => {
    const { agent, token } = await signUpAndShareList();
    const res = await agent
      .delete('/list-shares/7602')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List share data not found');
  });
});
