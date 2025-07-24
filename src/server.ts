import express from 'express';
import cors from 'cors';
import { PrismaClient, Company } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Autocomplete search endpoint (case-insensitive)
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string)?.trim();

  if (!query || query.length < 3) {
    return res.status(400).json({ message: 'Query must be at least 3 characters.' });
  }

  try {
    const results = await prisma.$queryRaw<Company[]>`
      SELECT * FROM Company
      WHERE
        (name LIKE ${query + '%'} COLLATE NOCASE OR ico LIKE ${query + '%'})
      ORDER BY name ASC
      LIMIT 10
    `;

    return res.json(results);
  } catch (err) {
    console.error('Error during search:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
