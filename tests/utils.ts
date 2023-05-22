import { readFileSync } from 'node:fs';
import pool from '../sql/pool.js';
import request from 'supertest';
import app from '../lib/app.js';
import { UserService } from '../lib/services/UserService.js';
import { User } from '../lib/models/User.js';
const sql = readFileSync('./sql/setup.sql', 'utf-8');

export function setupDb() {
  return pool.query(sql);
}

function closeAll() {
  return pool.end();
}

afterAll(closeAll);


// helper variables
export const testUser = {
  email: 'test@user.com',
  password: '123456',
  username: 'test_user'
};

export const testUser2 = {
  email: 'test2@user.com',
  password: 'password',
  username: 'second_user'
};

export const testUser3 = {
  email: 'third@user.com',
  password: 'password',
  username: 'third_user'
};

export const testUser4 = {
  email: 'fourth@user.com',
  password: 'password',
  username: 'test_user4'
};

export const testRecipe = {
  name: 'mac and cheese',
};

export const testIngredient = {
  name: 'milk',
  amount: '1 cup'
};

export const testItem = {
  item: 'bananas',
  quantity: '3',
};

export const testItem2 = {
  item: 'oat milk',
  quantity: null
};

export const testItem3 = {
  item: 'ground turkey',
  quantity: '1 lb'
};

export const testStep = {
  num: 1,
  detail: 'boil the pasta'
};

interface AuthAgentData {
  agent: request.SuperAgentTest;
  token: string;
  userId: string;
}

export async function signUp(): Promise<AuthAgentData> {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const userRes = await agent.get('/users/me')
    .set('Authorization', `Bearer ${token}`);
  const userId = userRes.body.user.id;

  return { agent, token, userId }; 
}



// category helper functions
type CreateCategoryInfo = {
  agent: request.SuperAgentTest;
  token: string;
  categoryId: string;
  listId: string;
}

type CreateListInfo = {
  agent: request.SuperAgentTest;
  token: string;
  listId: string;
}

export async function signUpAndCreateList(): Promise<CreateListInfo> {
  const agent = request.agent(app);
  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const listRes = await agent.post('/lists')
    .set('Authorization', `Bearer ${token}`);
  const listId = listRes.body.list.id;

  return { agent, token, listId };
}

export async function signUpAndCreateCategory(): Promise<CreateCategoryInfo> {
  const { agent, token, listId } = await signUpAndCreateList();
  const categoryRes = await agent.post('/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Bread', listId });
  const categoryId = categoryRes.body.category.id;

  return { agent, token, categoryId, listId };
}


// ingredients helper functions:
type RecipeAgentData = {
  agent: request.SuperAgentTest;
  token: string;
  userId: string;
  recipeId: string;
}

type SecondUserData = {
  token2: string;
  secondUserId: string;
}


export async function signUpAndCreateRecipe(): Promise<RecipeAgentData> {
  const agent = request.agent(app);

  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;

  const userRes = await agent.get('/users/me')
    .set('Authorization', `Bearer ${token}`);
  const userId = userRes.body.user.id;

  const newRecipeRes = await agent.post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(testRecipe);
  const recipeId = newRecipeRes.body.recipe.id;


  return { agent, token, userId, recipeId };
}

export async function createSecondaryUser(agent: request.SuperAgentTest): Promise<SecondUserData> {
  const secondUser = await UserService.create(testUser2);
  const secondUserId = secondUser.id;

  const signUpRes = await agent.post('/users/sessions').send(testUser2);
  const { token: token2 } = signUpRes.body;

  return { token2, secondUserId };
}


// list items helper functions;
export async function signUpAndGetInfo() {
  const agent = request.agent(app);
  
  const signUpRes = await agent.post('/users').send(testUser);
  const { token } = signUpRes.body;
  const getUserRes = await agent.get('/users/me').set('Authorization', `Bearer ${token}`);
  const { user } = getUserRes.body;
  
  return { agent, token, user };
}

type ListData = {
  listId: string;
  categoryId: string;
}

export async function createListWithCategory(agent: request.SuperAgentTest, token: string): Promise<ListData> {
  
  const newListRes = await agent
    .post('/lists')
    .set('Authorization', `Bearer ${token}`);
  const listId = newListRes.body.list.id;

  const categoryRes = await agent.post('/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Yellow', listId });
  const categoryId = categoryRes.body.category.id;
  
  return { listId, categoryId };

}

export async function getNewItemId(agent: request.SuperAgentTest, token: string, listId: string, categoryId: string): Promise<string> {

  const newItemRes = await agent
    .post(`/list-items?listId=${listId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...testItem, categoryId });
  
  return newItemRes.body.listItem.id;
}


// list share helper functions:
type ListShareRouteData = {
  listId: string;
  userId: string;
  token: string;
  agent: request.SuperAgentTest;
}

export async function signUpAndGetListShareData(): Promise<ListShareRouteData> {
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


// lists helper functions:
export async function createList(agent: request.SuperAgentTest, token: string): Promise<string> {
  
  const newListRes = await agent
    .post('/lists')
    .set('Authorization', `Bearer ${token}`);
  
  return newListRes.body.list.id;

}


// recipe shares helper functions:

interface SharedRecipeAgentData {
  agent: request.SuperAgentTest;
  token: string;
  token2: string;
  recipeId: string;
  shareId: string;
  sharedUserId: string;
}

export async function signUpAndShareRecipe(canEdit: boolean): Promise<SharedRecipeAgentData> {
  const { agent, token, recipeId } = await signUpAndCreateRecipe();

  const secondUser = await UserService.create(testUser2);
  const sharedUserId = secondUser.id;

  const shareRes = await agent.post('/recipe-shares')
    .set('Authorization', `Bearer ${token}`)
    .send({ recipeId, userId: secondUser.id, editable: canEdit });
  const shareId = shareRes.body.recipeShare.id;

  const { token: token2 } = (await agent.post('/users/sessions')
    .send(testUser2)).body;

  return { agent, token, token2, recipeId, shareId, sharedUserId };
}


// recipes helper functions:
export async function createRecipe(agent: request.SuperAgentTest, token: string): Promise<string> {
  const newRecipeRes = await agent.post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send(testRecipe);

  return newRecipeRes.body.recipe.id;
}


// recipe steps helper functions:
export async function createRecipeStep(agent: request.SuperAgentTest, token: string, recipeId: string): Promise<string> {
  const newStepRes = await agent.post(`/recipe-steps?recipeId=${recipeId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(testStep);

  return newStepRes.body.step.id;
}


// ingredients helper functions:
export async function addIngredient(agent: request.SuperAgentTest, token: string, recipeId: string): Promise<string> {
  
  const res = await agent.post(`/ingredients?recipeId=${recipeId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...testIngredient });

  return res.body.ingredient.id;
}

