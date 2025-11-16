// server/tests/integration/errorHandling.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Error Handling', () => {
  it('should return 400 for invalid post ID', async () => {
    const res = await request(app).get('/api/posts/invalid-id');
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for protected routes without auth', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Test', content: 'Test' });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    
    expect(res.status).toBe(404);
  });
});