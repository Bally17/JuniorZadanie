import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'; // 🔺 pridaj navrch súboru

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:id', async (req, res) => {
  const adId = parseInt(req.params.id, 10);
  if (isNaN(adId)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
      include: { company: true },
    });

    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit); 
    const page = pdfDoc.addPage([595.28, 841.89]);
    

    // 🔠 Načítaj vlastný font s podporou diakritiky
    const fontPath = path.join(__dirname, '../../fonts/charpentier-renaissance.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const { width, height } = page.getSize();
    const fontSize = 12;
    let y = height - 50;

    page.drawText(`Spoločnosť: ${ad.company.name}`, { x: 50, y, size: fontSize, font: customFont });
    y -= 20;
    page.drawText(`IČO: ${ad.company.ico}`, { x: 50, y, size: fontSize, font: customFont });
    y -= 20;
    page.drawText(`Adresa: ${ad.company.municipality}`, { x: 50, y, size: fontSize, font: customFont });
    y -= 30;
    page.drawText(`Inzerát:`, { x: 50, y, size: fontSize, font: customFont });
    y -= 20;

    const lines = (ad.adText || '').split('\n');
    for (const line of lines) {
      if (y < 50) break;
      page.drawText(line, { x: 60, y, size: fontSize, font: customFont });
      y -= 16;
    }

    // Vloženie loga
    if (ad.logoPath) {
      const logoPath = path.join(__dirname, '../../', ad.logoPath);
      if (fs.existsSync(logoPath)) {
        const imageBytes = fs.readFileSync(logoPath);
        const ext = path.extname(logoPath).toLowerCase();

        try {
          let image;
          if (ext === '.png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else if (ext === '.jpg' || ext === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
          } else {
            throw new Error(`Nepodporovaný formát obrázka: ${ext}`);
          }

          const imgDims = image.scale(0.25);
          page.drawImage(image, {
            x: width - imgDims.width - 50,
            y: 50,
            width: imgDims.width,
            height: imgDims.height,
          });
        } catch (err) {
          console.warn('Nepodarilo sa vložiť logo do PDF:', err);
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ad_${adId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Failed to generate PDF', error: String(err) });
  }
});

export default router;
