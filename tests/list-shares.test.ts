/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';
import { User } from '../lib/models/User.js';
import { List } from '../lib/models/List.js';

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

const testUser3 = {
  email: 'third@user.com',
  password: 'password',
  username: 'third_user'
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

describe('POST /list-shares (share list) tests', () => {
  beforeEach(setupDb);

  it('shares a list with a non-owner user at POST /list-shares', async () => {
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

  it('gives a 403 error for user unauthorized to share list', async () => {
    const { agent, userId, listId } = await signUpAndGetListShareData();
    const secondSignUpRes = await agent.post('/users').send(testUser3);
    const { token: token2 } = secondSignUpRes.body;

    const res = await agent.post('/list-shares')
      .set('Authorization', `Bearer ${token2}`)
      .send({ listId, userId, editable: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to share this list');
  });
});


type PostListData = {
  agent: request.SuperAgentTest;
  sharedUserId: string;
  listId: string;
  token: string;
  shareId: string;
}

async function signUpAndShareList(): Promise<PostListData> {
  const { agent, userId, listId, token } = await signUpAndGetListShareData(); 

  const shareRes = await agent.post('/list-shares')
    .set('Authorization', `Bearer ${token}`)
    .send({ listId, userId, editable: true });

  const shareId = shareRes.body.shareData.id;

  return { agent, sharedUserId: userId, token, listId, shareId };
}


describe('GET /list-shares/lists tests', () => {
  beforeEach(setupDb);

  it('gets lists shared with user at GET /list-shares/lists', async () => {
    const { agent, sharedUserId, listId } = await signUpAndShareList();

    const signInRes = await agent
      .post('/users/sessions')
      .send(testUser2);
    const { token } = signInRes.body;

    const sharedList = await List.findById(listId);

    const res = await agent
      .get(`/list-shares/lists?userId=${sharedUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared lists found',
      sharedLists: expect.any(Array)
    });
    expect(res.body.sharedLists[0]).toEqual({ 
      ...sharedList,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, sharedUserId } = await signUpAndShareList();

    const res = await agent
      .get(`/list-shares/lists?userId=${sharedUserId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives 403 error for unauthorized user', async () => {
    const { agent, sharedUserId } = await signUpAndShareList();

    const signUpRes = await agent.post('/users')
      .send(testUser3);
    const { token } = signUpRes.body;

    const res = await agent
      .get(`/list-shares/lists?userId=${sharedUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this information');
  });
});

describe('GET /list-shares/users tests', () => {
  beforeEach(setupDb);

  it('gets users with whom list is shared at GET /list-shares/users', async () => {
    const { agent, listId, token, sharedUserId } = await signUpAndShareList();

    const sharedUser = await User.findById(sharedUserId);

    const res = await agent
      .get(`/list-shares/users?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared users found successfully',
      users: expect.any(Array)
    });
    expect(res.body.users[0]).toEqual({
      ...sharedUser
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, listId } = await signUpAndShareList();

    const res = await agent
      .get(`/list-shares/users?listId=${listId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, listId } = await signUpAndGetListShareData();

    const signUpRes = await agent.post('/users').send(testUser3);
    const { token } = signUpRes.body;
    
    const res = await agent
      .get(`/list-shares/users?listId=${listId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this information');
  });

  it('gives a 404 error for nonexistent list', async () => {
    const { agent, token } = await signUpAndShareList();

    const res = await agent
      .get('/list-shares/users?listId=458239')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('List not found');
  });
});

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
      deletedShareData: expect.objectContaining({
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
});
