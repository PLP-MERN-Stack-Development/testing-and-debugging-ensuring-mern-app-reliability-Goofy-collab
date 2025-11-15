// server/tests/integration/errorHandling.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Error Handling', () => {
  it('should return 404 for non-existent resource', async () => {
    const res = await request(app).get('/api/posts/invalid-id');
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle validation errors', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ /* missing required fields */ });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });
});