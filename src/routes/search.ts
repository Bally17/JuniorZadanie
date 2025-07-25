import express from 'express';
import { PrismaClient, Company } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const query = (req.query.q as string)?.trim();

  if (!query || query.length < 3) {
    return res.status(400).json({ message: 'Query must be at least 3 characters.' });
  }

  try {
    const results = await prisma.$queryRaw<Company[]>`
      SELECT * FROM Company
      WHERE (name LIKE ${query + '%'} COLLATE NOCASE OR ico LIKE ${query + '%'})
      ORDER BY name ASC
      LIMIT 10
    `;
    res.json(results);
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
