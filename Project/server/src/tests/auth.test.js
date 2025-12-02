import request from 'supertest';
import app from '../testApp.js'; // export your Express app from a tiny wrapper

describe('Auth', () => {
  test('rejects weak password at register', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 't@test.com', password: 'weak', name: 'T'
    });
    expect(res.statusCode).toBe(400);
  });

  test('requires captcha on login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 't@test.com', password: 'Whatever1!', captcha: ''
    });
    expect(res.statusCode).toBe(400);
  });
});
