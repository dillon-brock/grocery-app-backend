import { createRecipe, createSecondaryUser, setupDb, signUp, signUpAndCreateRecipe, signUpAndShareRecipe } from '../utils.js';
// import request from 'supertest';
// import app from '../../lib/app.js';

describe('POST /plans-recipes', () => {
  beforeEach(setupDb);

  it('adds a recipe to a meal plan at POST /plans-recipes', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-07-11' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        planId: mealPlanRes.body.mealPlan.id,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe created successfully',
      planRecipe: {
        id: expect.any(String),
        recipeId,
        planId: mealPlanRes.body.mealPlan.id,
        meal: 'Dinner'
      }
    });
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token } = await signUp();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-07-11' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        planId: mealPlanRes.body.mealPlan.id,
        recipeId: '101',
        meal: 'Breakfast'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 404 error for nonexistent meal plan', async () => {
    const { agent, token } = await signUp();
    const recipeId = await createRecipe(agent, token);

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        recipeId, 
        planId: '202',
        meal: 'Lunch'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Meal plan not found');
  });

  it('gives a 403 error for user not authorized to access recipe', async () => {
    const { agent, recipeId } = await signUpAndCreateRecipe();
    const { token2 } = await createSecondaryUser(agent);

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token2}`)
      .send({ date: '2023-08-12' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({ 
        planId: mealPlanRes.body.mealPlan.id,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 403 error for user not authorized to edit meal plan', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(true);

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-10' });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        planId: mealPlanRes.body.mealPlan.id,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this meal plan');
  });

  it('adds recipe to meal plan for user with edit access', async () => {
    const { agent, token, token2, recipeId, sharedUserId } = await signUpAndShareRecipe(false);

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-10' });
    const mealPlanId = mealPlanRes.body.mealPlan.id;

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId: mealPlanId,
        userId: sharedUserId,
        editable: true
      });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        planId: mealPlanId,
        recipeId,
        meal: 'Lunch'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe created successfully',
      planRecipe: {
        id: expect.any(String),
        planId: mealPlanId,
        recipeId,
        meal: 'Lunch'
      }
    });
  });

  it('gives a 400 error for missing planId', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, meal: 'Dinner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - planId is required');
  });

  it('gives a 400 error for missing recipeId', async () => {
    const { agent, token } = await signUp();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-10' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, meal: 'Dinner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - recipeId is required');
  });

  it('gives a 400 error for missing meal', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-10' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, planId });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - meal is required');
  });

  it('gives a 400 error for invalid planId type', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, planId: 1, meal: 'Dinner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - planId must be string');
  });

  it('gives a 400 error for invalid recipeId type', async () => {
    const { agent, token } = await signUp();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-10' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId: {}, planId, meal: 'Dinner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - recipeId must be string');
  });

  it('gives a 400 error for invalid meal type', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

    const mealPlanRes = await agent.post('/meal-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2023-06-10' });
    const planId = mealPlanRes.body.mealPlan.id;

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, recipeId, meal: 41 });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - meal must be string');
  });
});
