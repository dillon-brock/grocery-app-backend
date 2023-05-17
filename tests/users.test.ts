/* @jest-environment node */
import { setupDb, signUpAndGetInfo, testUser, testUser2, testUser4 } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';
import { testUser3 } from './utils.js';

describe('POST /users (sign up) tests', () => {
  beforeEach(setupDb);

  it('signs up a new user on POST /users', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Signed up and logged in successfully',
      token: expect.any(String)
    });
  });

  it('gives a 409 error if user with username already exists', async () => {
    const agent = request.agent(app);
    await agent.post('/users').send(testUser);
    const res = await agent
      .post('/users')
      .send({ ...testUser2, username: testUser.username });
    
    expect(res.status).toBe(409);
    expect(res.body.message).toEqual('Username already exists');
  });

  it('gives a 409 error if user with email already exists', async () => {
    const agent = request.agent(app);
    await agent.post('/users').send(testUser);
    const res = await agent
      .post('/users')
      .send({ ...testUser2, email: testUser.email });

    expect(res.status).toBe(409);
    expect(res.body.message).toEqual('Email already exists');
  });

  it('gives a 400 error if password is too short', async () => {
    const res = await request(app)
      .post('/users')
      .send({ ...testUser, password: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Password must be at least 6 characters long');
  });
});

describe('POST /users/sessions (sign in) tests', () => {
  beforeEach(setupDb);

  it('signs in existing user on POST /users/sessions', async () => {
    await UserService.create({ ...testUser });
    const res = await request(app)
      .post('/users/sessions')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Signed in successfully',
      token: expect.any(String)
    });
  });

  it('gives a 400 error if email does not exist', async () => {
    const res = await request(app)
      .post('/users/sessions')
      .send({ email: 'bademail@test.com', password: 'password' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid email');
  });

  it('gives a 400 error if password is wrong', async () => {
    await UserService.create({ ...testUser });
    const res = await request(app)
      .post('/users/sessions')
      .send({ email: testUser.email, password: '123457' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid password');
  });
});

describe('GET /users/me tests', () => {
  beforeEach(setupDb);

  it('gets current user at GET /users/me', async () => {
    const agent = request.agent(app);
    const signUpRes = await agent.post('/users').send(testUser);
    const { token } = signUpRes.body;
    const res = await agent
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Current user found');
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: testUser.email,
      username: testUser.username
    });
  });

  it('returns null when no user is signed in', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'No current user',
      user: null
    });
  });
});



describe('GET /users', () => {
  beforeEach(setupDb);

  it('finds users by username at GET /users', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const otherUser = await UserService.create(testUser4);
    await UserService.create(testUser3);

    const res = await agent.get('/users?username=test')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toEqual(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body).toEqual({
      message: 'Users found',
      users: expect.arrayContaining([{
        id: otherUser.id,
        username: otherUser.username
      }])
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).get('/users?username=test');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('returns different message if no users found', async () => {
    const { agent, token } = await signUpAndGetInfo();
    const res = await agent.get('/users?username=tuivjsdfk')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'No users found',
      users: []
    });
  });
});
