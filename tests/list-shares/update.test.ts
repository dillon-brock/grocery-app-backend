import { setupDb, signUpAndShareList } from '../utils.js';

describe('PUT /list-shares/:id', () => {
  beforeEach(setupDb);

  it('updates share data at PUT /list-shares/:id', async () => {
    const { listId, sharedUserId, token, agent, shareId } = await signUpAndShareList();

    const res = await agent.put(`/list-shares/${shareId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ editable: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List share updated successfully',
      shareData: {
        id: shareId,
        userId: sharedUserId,
        listId,
        editable: false
      }
    });
  });
});
