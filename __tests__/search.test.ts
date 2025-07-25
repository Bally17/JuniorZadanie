import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import searchRoute from '../src/routes/search';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let app: Express;

beforeAll(() => {
  app = express();
  app.use(cors());
  app.use('/api/search', searchRoute);
});

describe('GET /api/search', () => {
  it('should return 400 if query parameter is missing', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Query must be at least 3 characters.');
  });

  it('should return 200 and an array of results when valid query is provided', async () => {
    const res = await request(app).get('/api/search?q=123');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const first = res.body[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('ico');
      expect(first).toHaveProperty('municipality');
    }
  });

  it('should return empty array when no company matches the query', async () => {
    const res = await request(app).get('/api/search?q=nonexistentcompany');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should return matching company for autocomplete', async () => {
    const company = await prisma.company.create({
        data: {
        rpoId: 12345678,
        ico: '12345678',
        name: 'Autocomplete Test Company',
        municipality: 'TestCity',
        establishment: new Date(),
        },
    });

    const res = await request(app).get('/api/search?q=Autocomplete');
    expect(res.status).toBe(200);
    const match = res.body.find((c: any) => c.name === 'Autocomplete Test Company');
    expect(match).toBeDefined();

    await prisma.company.delete({ where: { id: company.id } });
    });
});
