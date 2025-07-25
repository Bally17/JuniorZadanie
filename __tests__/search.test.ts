import request from 'supertest';
import express from 'express';
import cors from 'cors';
import searchRoute from '../src/routes/search';

const app = express();
app.use(cors());
app.use('/api/search', searchRoute);

describe('GET /api/search', () => {
  it('should return 400 if query parameter is missing', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 200 and array of results if valid query is provided', async () => {
    const res = await request(app).get('/api/search?q=123');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return empty array if no matches found', async () => {
    const res = await request(app).get('/api/search?q=nonexistentcompanyname');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
