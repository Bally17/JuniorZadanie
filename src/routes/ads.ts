import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const isValid = ['image/jpeg', 'image/png'].includes(file.mimetype);
    if (!isValid) return cb(new Error('Only JPG and PNG files are allowed'));
    cb(null, true);
  },
});

router.get('/', async (_req, res) => {
  try {
    const ads = await prisma.advertisement.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(ads);
  } catch (err) {
    console.error('Error fetching ads:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', upload.single('logo'), async (req, res) => {
  const { companyId, adText } = req.body;
  if (!companyId || !adText) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  let logoPath: string | undefined;
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

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid ad ID' });

  try {
    await prisma.advertisement.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting ad:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
