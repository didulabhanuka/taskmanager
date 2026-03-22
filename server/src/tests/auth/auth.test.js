const request = require('supertest');
const app = require('../../app');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../testHelper');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await disconnectTestDB());

describe('Auth — Register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('should return 400 if email is already in use', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email already in use');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
    });

    expect(res.statusCode).toBe(500);
  });
});

describe('Auth — Login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should login and return a token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 401 for non existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should return 400 if fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});