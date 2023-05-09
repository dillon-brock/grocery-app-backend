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

const testRecipe = {
  name: 'mac and cheese',
  description: 'so cheesy and delicious'
};

interface AuthAgentData {
  agent: request.SuperAgentTest;
  token: string;
  userId: string;
}

const signUp = async (): Promise<AuthAgentData> => {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const userRes = await agent.get('/users/me')
    .set('Authorization', `Bearer ${token}`);
  const userId = userRes.body.user.id;

  return { agent, token, userId }; 
};


const createRecipe = async (agent: request.SuperAgentTest, token: string): Promise<string>  => {
  const newRecipeRes = await agent.post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(testRecipe);

  return newRecipeRes.body.recipe.id;
};

describe('POST /recipes tests', () => {
  beforeEach(setupDb);

  it('creates a new recipe at POST /recipes', async () => {
    const { agent, token, userId } = await signUp();

    const res = await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(testRecipe);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe created successfully',
      recipe: {
        ...testRecipe,
        id: expect.any(String),
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app).post('/recipes')
      .send(testRecipe);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('You must be signed in to continue');
  });
});

describe('GET /recipes test', () => {
  beforeEach(setupDb);

  it('gets all of a users recipes at GET /recipes', async () => {
    const { agent, token, userId } = await signUp();

    await agent.post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(testRecipe);

    const res = await agent.get('/recipes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipes found',
      recipes: expect.any(Array)
    });
    expect(res.body.recipes[0]).toEqual({
      ...testRecipe,
      id: expect.any(String),
      ownerId: userId,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const res = await request(app)
      .get('/recipes');

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});

describe('GET /recipes/:id tests', () => {
  beforeEach(setupDb);

  it('gets a recipe by id at GET /recipes/:id', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe found',
      recipe: {
        ...testRecipe,
        id: recipeId,
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('gets a recipe by id for user with view access', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: false });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 } = signInRes.body;

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe found',
      recipe: {
        ...testRecipe,
        id: recipeId,
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.get(`/recipes/${recipeId}`);
    
    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const signUpRes = await agent.post('/users')
      .send(testUser2);
    const { token: token2 } = signUpRes.body;

    const res = await agent.get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUp();

    const res = await agent.get('/recipes/56891')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });
});



describe('PUT /recipes/:id tests', () => {
  beforeEach(setupDb);

  it('updates a recipe at PUT /recipes/:id', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe updated successfully',
      recipe: {
        name: 'Updated name',
        description: testRecipe.description,
        id: expect.any(String),
        ownerId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('updates a recipe for user with edit access', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const secondUser = await UserService.create(testUser2);

    await agent.post('/recipe-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, userId: secondUser.id, editable: true });

    const signInRes = await agent.post('/users/sessions')
      .send(testUser2);
    const { token: token2 }: { token: string } = await signInRes.body; 

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe updated successfully',
      recipe: {
        name: 'Updated name',
        id: expect.any(String),
        description: testRecipe.description,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        ownerId: userId
      }
    });
  });

  it('gives a 403 error for unauthorized user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const signUpRes = await agent.post('/users').send(testUser2);
    const { token: token2 }: { token: string } = signUpRes.body;

    const res = await agent.put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 401 error for unauthenticated user', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.put(`/recipes/${recipeId}`)
      .send({ name: 'Updated name' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You must be signed in to continue');
  });
});


describe('DELETE /recipes/:id tests', () => {
  beforeEach(setupDb);

  it('deletes a recipe at DELETE /recipes/:id', async () => {
    const { agent, token, userId } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.delete(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Recipe deleted successfully',
      recipe: {
        ...testRecipe,
        id: expect.any(String),
        ownerId: userId,
        updatedAt: expect.any(String),
        createdAt: expect.any(String)
      }
    });
  });
});

