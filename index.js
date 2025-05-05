//packge.json (type: module) substitui .mjs

import express from 'express';
import connectDB from './db.js';

const app = express();
await connectDB();
app.use(express.json());
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));