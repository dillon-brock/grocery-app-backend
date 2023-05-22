import { setupDb, testUser } from '../utils.js';
import request from 'supertest';
import app from '../../lib/app.js';
import { UserService } from '../../lib/services/UserService.js';

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
