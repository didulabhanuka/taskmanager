const request = require('supertest');
const app = require('../../app');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../testHelper');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await disconnectTestDB());

// Helper to register and get a token
const getToken = async (email = 'test@example.com') => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });
  return res.body.token;
};

describe('Board — Create', () => {
  it('should create a board and return it', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Board', description: 'A test board' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Test Board');
    expect(res.body.data.members).toHaveLength(1);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/boards')
      .send({ title: 'Test Board' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Board — Get', () => {
  it('should return all boards for the user', async () => {
    const token = await getToken();

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Board 1' });

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Board 2' });

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return a single board with columns and cards', async () => {
    const token = await getToken();

    const createRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Board' });

    const boardId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.board.title).toBe('Test Board');
    expect(res.body.data.columns).toBeDefined();
    expect(res.body.data.cards).toBeDefined();
  });
});

describe('Board — Update', () => {
  it('should update board title', async () => {
    const token = await getToken();

    const createRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Old Title' });

    const boardId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('New Title');
  });
});

describe('Board — Delete', () => {
  it('should delete a board', async () => {
    const token = await getToken();

    const createRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete' });

    const boardId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});