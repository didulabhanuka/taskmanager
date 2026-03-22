const request = require('supertest');
const app = require('../../app');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../testHelper');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await disconnectTestDB());

// Helper to set up a board and column for card tests
const setup = async () => {
  const authRes = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });

  const token = authRes.body.token;

  const boardRes = await request(app)
    .post('/api/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Board' });

  const boardId = boardRes.body.data._id;

  const columnRes = await request(app)
    .post('/api/columns')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'To Do', boardId });

  const columnId = columnRes.body.data._id;

  return { token, boardId, columnId };
};

describe('Card — Create', () => {
  it('should create a card and return it', async () => {
    const { token, boardId, columnId } = await setup();

    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Card', columnId, boardId });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Test Card');
    expect(res.body.data.order).toBe(0);
  });

  it('should assign order incrementally', async () => {
    const { token, boardId, columnId } = await setup();

    await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Card 1', columnId, boardId });

    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Card 2', columnId, boardId });

    expect(res.body.data.order).toBe(1);
  });
});

describe('Card — Update', () => {
  it('should update a card title', async () => {
    const { token, boardId, columnId } = await setup();

    const createRes = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Old Title', columnId, boardId });

    const cardId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('New Title');
  });
});

describe('Card — Move', () => {
  it('should move a card to a different column', async () => {
    const { token, boardId, columnId } = await setup();

    const column2Res = await request(app)
      .post('/api/columns')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'In Progress', boardId });

    const column2Id = column2Res.body.data._id;

    const cardRes = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Card', columnId, boardId });

    const cardId = cardRes.body.data._id;

    const res = await request(app)
      .patch(`/api/cards/${cardId}/move`)
      .set('Authorization', `Bearer ${token}`)
      .send({ toColumnId: column2Id, newOrder: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.card.columnId).toBe(column2Id);
  });
});

describe('Card — Delete', () => {
  it('should delete a card', async () => {
    const { token, boardId, columnId } = await setup();

    const cardRes = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete', columnId, boardId });

    const cardId = cardRes.body.data._id;

    const res = await request(app)
      .delete(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});