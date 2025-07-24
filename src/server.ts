import express from 'express';
import cors from 'cors';
import { PrismaClient, Company } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const isValid = ['image/jpeg', 'image/png'].includes(file.mimetype);
    if (!isValid) {
        return cb(new Error('Only JPG and PNG files are allowed'));
    }
    cb(null, true);
    }
});

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.post('/api/ads', upload.single('logo'), async (req, res) => {
  const { companyId, adText } = req.body;

  if (!companyId || !adText) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  let logoPath: string | undefined = undefined;

  if (req.file) {
    const ext = path.extname(req.file.originalname);
    const newFileName = `${req.file.filename}${ext}`;
    const newPath = path.join('uploads', newFileName);
    fs.renameSync(req.file.path, newPath);
    logoPath = newPath;
  }

  try {
    const newAd = await prisma.advertisement.create({
      data: {
        companyId: parseInt(companyId, 10),
        adText,
        logoPath,
      }
    });

    return res.status(201).json(newAd);
  } catch (err) {
    console.error('Error creating ad:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/ads', async (req, res) => {
  try {
    const ads = await prisma.advertisement.findMany({
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(ads);
  } catch (err) {
    console.error('Error fetching ads:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
