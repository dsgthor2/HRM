import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Auth API', () => {
  it('should reject login with missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400); // Because it requires email and password
  });
});
