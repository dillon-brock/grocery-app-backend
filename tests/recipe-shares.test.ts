/* @jest-environment node */
import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';

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

const testRecipe = {
  name: 'mac and cheese',
  description: 'so cheesy and delicious'
};

interface RecipeAgentData {
  agent: request.SuperAgentTest;
  token: string;
  recipeId: string;
}

interface SharedRecipeAgentData extends RecipeAgentData {
  token2: string;
  shareId: string;
  sharedUserId: string;
}

async function signUpAndCreateRecipe(): Promise<RecipeAgentData> {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const recipeRes = await agent.post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(testRecipe);
  const recipeId = recipeRes.body.recipe.id;

  return { agent, token, recipeId };
}

async function signUpAndShareRecipe(): Promise<SharedRecipeAgentData> {
  const { agent, token, recipeId } = await signUpAndCreateRecipe();

  const secondUser = await UserService.create(testUser2);
  const sharedUserId = secondUser.id;

  const shareRes = await agent.post('/recipe-shares')
    .set('Authorization', `Bearer ${token}`)
    .send({ recipeId, userId: secondUser.id, editable: false });
  const shareId = shareRes.body.recipeShare.id;

  const { token: token2 } = (await agent.post('/users/sessions')
    .send(testUser2)).body;

  return { agent, token, token2, recipeId, shareId, sharedUserId };
}


describe('POST /recipe-shares tests', () => {
  beforeEach(setupDb);

  it('shares a recipe at POST /recipe-shares', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe shared successfully',
      recipeShare: {
        id: expect.any(String),
        recipeId,
        editable: false,
        userId: secondUser.id
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    const signUpRes = await agent.post('/users').send(testUser3);
    const { token } = signUpRes.body;

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, recipeId, editable: true });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to share this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .send({ userId: secondUser.id, recipeId, editable: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUpAndCreateRecipe();
    const secondUser = await UserService.create(testUser2);

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: secondUser.id, recipeId: '794921', editable: false });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 404 error for nonexistent user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: '358', recipeId, editable: true });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('User not found');
  });
});

describe('GET /recipe-shares/recipes tests', () => {
  beforeEach(setupDb);

  test('gets recipes shared with user at GET /recipes-shares/recipes', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent.get('/recipe-shares/recipes')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared recipes found',
      recipes: expect.any(Array)
    });
    expect(res.body.recipes[0]).toEqual({
      ...testRecipe,
      id: recipeId,
      ownerId: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    const res = await agent.get('/recipe-shares/recipes');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});

describe('GET /recipe-shares/users tests', () => {
  beforeEach(setupDb);

  test('gets list of users with access to list at GET /recipe-shares/users', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: true });

    const res = await agent.get(`/recipe-shares/users?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Shared users found',
      users: expect.any(Array)
    });
    expect(res.body.users[0]).toEqual({ 
      email: testUser2.email,
      username: testUser2.username
    });
  });

  it('gives a 401 error for unauthenticated users', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: true });

    const res = await agent.get(`/recipe-shares/users?recipeId=${recipeId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized users', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const secondUser = await UserService.create(testUser2);
    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: true });

    const { token: token2 } = (await agent.post('/users/sessions')
      .send(testUser2)).body;

    const res = await agent.get(`/recipe-shares/users?recipeId=${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to view this information');
  });
});


describe('PUT /recipe-shares/:id tests', () => {
  beforeEach(setupDb);

  it('updates a users permissions at PUT /recipe-shares/:id', async () => {
    const { agent, token, shareId, recipeId, sharedUserId } = await signUpAndShareRecipe();

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
});
