import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const isValid = ['image/jpeg', 'image/png'].includes(file.mimetype);
    if (!isValid) {
      return cb(new Error('Only JPG and PNG files are allowed'));
    }
    cb(null, true);
  },
});

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = (page - 1) * limit;

  try {
    const [ads, totalCount] = await Promise.all([
      prisma.advertisement.findMany({
        skip,
        take: limit,
        include: { company: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.advertisement.count()
    ]);

    const pages = Math.ceil(totalCount / limit);
    res.json({ ads, pages, totalCount });
  } catch (err) {
    console.error('Error fetching ads:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/', (req, res, next) => {
  upload.single('logo')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image is too large. Max size is 5 MB.' });
      }
      return res.status(400).json({ message: 'Error uploading image.' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
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
    console.error('Error creating advertisement:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid advertisement ID' });

  try {
    const ad = await prisma.advertisement.findUnique({ where: { id } });
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });

    if (ad.logoPath) {
      const fullPath = path.join(__dirname, '../../', ad.logoPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await prisma.advertisement.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting advertisement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
