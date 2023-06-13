import { createMealPlan, createSecondaryUser, setupDb, signUpAndCreateMealPlan, signUpAndCreateRecipe, signUpAndShareRecipe } from '../utils.js';

describe('POST /plans-recipes', () => {
  beforeEach(setupDb);

  it('adds a recipe to a meal plan at POST /plans-recipes', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const planId = await createMealPlan(agent, token, '2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        planId,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe created successfully',
      planRecipe: {
        id: expect.any(String),
        recipeId,
        planId,
        meal: 'Dinner'
      }
    });
  });

  it('gives a 404 error for nonexistent recipe', async () => {
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        planId,
        recipeId: '101',
        meal: 'Breakfast'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('gives a 404 error for nonexistent meal plan', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();

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
    const planId = await createMealPlan(agent, token2, '2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({ 
        planId,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You do not have access to this recipe');
  });

  it('gives a 403 error for user not authorized to edit meal plan', async () => {
    const { agent, token, token2, recipeId } = await signUpAndShareRecipe(true);
    const planId = await createMealPlan(agent, token, '2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        planId,
        recipeId,
        meal: 'Dinner'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toEqual('You are not authorized to edit this meal plan');
  });

  it('adds recipe to meal plan for user with edit access', async () => {
    const { agent, token, token2, recipeId, sharedUserId } = await signUpAndShareRecipe(false);
    const planId = await createMealPlan(agent, token, '2023-06-13');

    await agent.post('/plan-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId,
        userId: sharedUserId,
        editable: true
      });

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        planId,
        recipeId,
        meal: 'Lunch'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Plan recipe created successfully',
      planRecipe: {
        id: expect.any(String),
        planId,
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
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, meal: 'Dinner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - recipeId is required');
  });

  it('gives a 400 error for missing meal', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const planId = await createMealPlan(agent, token, '2023-06-13');

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
    const { agent, token, planId } = await signUpAndCreateMealPlan('2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId: {}, planId, meal: 'Dinner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - recipeId must be string');
  });

  it('gives a 400 error for invalid meal type', async () => {
    const { agent, token, recipeId } = await signUpAndCreateRecipe();
    const planId = await createMealPlan(agent, token, '2023-06-13');

    const res = await agent.post('/plans-recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId, recipeId, meal: 41 });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Invalid payload - meal must be string');
  });
});
