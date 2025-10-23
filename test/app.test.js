const request = require('supertest');
const app = require('../app');

describe('API endpoints', () => {
  test('GET /ping responde 200', () => {
    return request(app).get('/ping').expect(200);
  });

  test('GET /about responde 200', () => {
    return request(app).get('/about').expect(200);
  });
});