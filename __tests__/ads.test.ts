import request from 'supertest';
import app from './testServer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /api/ads', () => {
  let companyId: number;

  beforeAll(async () => {
    const testCompany = await prisma.company.create({
      data: {
        rpoId: 99999999,
        ico: '99999999',
        name: 'Test Company XYZ',
        municipality: 'Test Town',
        establishment: new Date(),
      },
    });

    companyId = testCompany.id;
  });

  afterAll(async () => {
    await prisma.advertisement.deleteMany({ where: { companyId } });
    await prisma.company.delete({ where: { id: companyId } });
    await prisma.$disconnect();
  });

  it('should create an advertisement and return 201', async () => {
    const res = await request(app)
      .post('/api/ads')
      .field('companyId', companyId.toString())
      .field('adText', 'Test Ad Text')
      .field('isTop', 'false');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.adText).toBe('Test Ad Text');
  });
});
