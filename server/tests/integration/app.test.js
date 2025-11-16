// server/tests/integration/app.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Basic API Tests', () => {
  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api', () => {
    it('should return 200 and API message', async () => {
      const res = await request(app).get('/api');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('API is working');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/nonexistent');
      
      expect(res.status).toBe(404);
    });
  });
});