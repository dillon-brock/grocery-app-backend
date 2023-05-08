import { setupDb } from './utils.js';
import request from 'supertest';
import app from '../lib/app.js';

const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
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
});

