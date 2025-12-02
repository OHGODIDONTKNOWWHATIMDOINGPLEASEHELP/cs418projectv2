import request from 'supertest';
import app from '../testApp.js';

describe('Advising', () => {
  test('cannot update approved record', async () => {
    // mock auth: supply a valid Authorization header with a test JWT or stub requireAuth
    const token = 'Bearer <test-jwt>';
    const id = '<approvedDocId>'; // or create one in a setup step

    const res = await request(app)
      .put(`/api/advising/${id}`)
      .set('Authorization', token)
      .send({ currentTerm: 'Fall 2025' });

    expect([400,403]).toContain(res.statusCode);
  });
});
