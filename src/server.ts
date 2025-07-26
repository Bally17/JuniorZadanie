import express from 'express';
import cors from 'cors';
import path from 'path';
import adsRoutes from './routes/ads';
import searchRoutes from './routes/search';
import pdfRoutes from './routes/pdf';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/ads', adsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/pdf', pdfRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


/**
 * © 2025 Bc. Martin Ballay
 * Licensed under the MIT License.
 */
