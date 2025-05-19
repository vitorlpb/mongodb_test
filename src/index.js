//packge.json (type: module) substitui .mjs
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

import routes from './back/routes.js';

app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
