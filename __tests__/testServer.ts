// testServer.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import adsRoute from '../src/routes/ads';
import searchRoute from '../src/routes/search';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/ads', adsRoute);
app.use('/api/search', searchRoute);

export default app;
