/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';
import { User } from '../lib/models/User.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

const testUser2 = {
  email: 'test2@user.com',
  password: 'password',
  username: 'second_user'
};

type ListShareRouteData = {
  listId: string;
  userId: string;
  token: string;
  agent: request.SuperAgentTest;
}

async function signUpAndGetListShareData(): Promise<ListShareRouteData> {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;
  const otherUser: User = await UserService.create(testUser2);
  const newListRes = await agent
    .post('/lists')
    .set('Authorization', `Bearer ${token}`);
  const { list } = newListRes.body;

  return { listId: list.id, userId: otherUser.id, token, agent };
}

describe('POST /users-lists (share list) tests', () => {
  beforeEach(setupDb);

  it('shares a list with a non-owner user at POST /users-lists', async () => {
    const { listId, userId, token, agent } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId, editable: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'List shared successfully',
      shareData: {
        id: expect.any(String),
        userId,
        listId,
        editable: true
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, listId, userId } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .send({ listId, userId, editable: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
  
  it('gives a 404 error for nonexistent list', async () => {
    const { agent, token, userId } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId: '107', userId, editable: true });
    
    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });

  it('gives a 404 error for nonexistent user', async () => {
    const { agent, token, listId } = await signUpAndGetListShareData();

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId, userId: '39492', editable: true });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});
